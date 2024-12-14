import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Button, Badge, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <strong>Description: </strong>{job?.description}
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
      <Button colorScheme="blue" size="lg">
        Apply Now
      </Button>
    </Box>
  );
};

export default JobDetails;
