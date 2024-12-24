import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Spinner, Stack, List, ListItem, Button, Flex } from "@chakra-ui/react";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!userData || !userData.applications || userData.applications.length === 0) {
        return;
      }

      try {
        const appliedJobsRef = collection(db, "jobs");
        const appliedJobsQuery = query(
          appliedJobsRef
        );
        
        const appliedJobsSnapshot = await getDocs(appliedJobsQuery);
        const appliedJobs = appliedJobsSnapshot.docs
          .filter(doc => userData.applications.includes(doc.id))
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

        if (appliedJobs.length > 0) {
          setAppliedJobs(appliedJobs);
        } else {
          console.log("No jobs found for the user.");
        }
      } catch (error) {
        console.error("Error fetching applied jobs: ", error);
      }
    };

    if (userData) {
      fetchAppliedJobs();
    }
  }, [userData]);

  if (loading) {
    return (
      <Box textAlign="center" p={6}>
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box p={8} mt={8} maxW="900px" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="xl" mb={4}>
        Profile
      </Heading>
      <Stack spacing={4}>
        <Text><strong>Name:</strong> {userData.name}</Text>
        <Text><strong>Email:</strong> {userData.email}</Text>
        <Text><strong>Location:</strong> {userData.location}</Text>
        <Text><strong>Skills:</strong> {userData.skills.join(", ")}</Text>
      </Stack>

      <Heading as="h3" size="lg" mt={8} mb={4}>
        Applied Jobs
      </Heading>
      {appliedJobs.length > 0 ? (
        <List spacing={4}>
          {appliedJobs.map((job, index) => (
            <Box boxShadow="lg" p={4} rounded="md" borderWidth={1}> 
            <ListItem key={index}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text><strong>Title:</strong> {job.title}</Text>
                  <Text><strong>Company:</strong> {job.company}</Text>
                  <Text><strong>Location:</strong> {job.location}</Text>
                </Box>
                <Button colorScheme="blue" size="sm" onClick={() => navigate(`/job-details/${job.id}`)}>
                  View Job Details
                </Button>
              </Flex>
            </ListItem>
            </Box>
          ))}
        </List>
      ) : (
        <Box>
          <Text mb={2}>Oops!! you haven't applied any jobs</Text>
          <Button colorScheme="blue" onClick={() => navigate("/jobs")}>Click here to apply</Button>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
