import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Button, Badge, Spinner, ListItem, List } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    setCurrentUser(user);
    console.log("Current user:", user);
  } else {
    setCurrentUser(null);
    console.log("No user signed in");
  }
});
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobDoc = doc(db, "jobs", jobId);
        const jobSnapshot = await getDoc(jobDoc);
        if (jobSnapshot.exists()) {
          setJob(jobSnapshot.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={8} mt={8} maxW="800px" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="xl" mb={4}>
        {job?.title}
      </Heading>
      <Text fontSize="lg" color="gray.500" mb={4}>
        {job?.company} | Location: {job?.location}
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Skills: </strong>
        {job?.skills.map((skill, index) => (
          <Badge key={index} colorScheme="green" mr={2}>
            {skill}
          </Badge>
        ))}
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Experience Required: </strong>{job?.experience} years
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Description: </strong>
        {job?.description}
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Posted On: </strong>{job?.postedOn}
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Job Type: </strong>{job?.jobType}
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Salary: </strong> {job?.salary ? `₹${job?.salary} per month` : ""}
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Responsibilities: </strong>
        <List styleType="disc" ps={4}>
        {job?.responsibilities?.map((responsibility, index) => (
          <ListItem key={index}>
            {responsibility}
          </ListItem>
        ))}
        </List>
      </Text>
      <Text fontSize="md" color="gray.600" mb={4}>
        <strong>Qualifications: </strong>
        <List styleType="disc" ps={4}>
        {job?.qualifications?.map((qualification, index) => (
          <ListItem key={index}>
            {qualification}
          </ListItem>
        ))}
        </List>
      </Text>
      <Button colorScheme="blue" size="lg" onClick={() => navigate(`/application/${jobId}`)} disabled={job?.applicants?.includes(currentUser?.uid)}>
        {job?.applicants?.includes(currentUser?.uid) ? 'Already Applied' : 'Apply Now'}
      </Button>

    </Box>
  );
};

export default JobDetails;
