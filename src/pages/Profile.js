import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Spinner, Stack } from "@chakra-ui/react";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
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

  if (loading) {
    return (
      <Box textAlign="center" p={6}>
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box textAlign="center" p={6}>
        <Text>No profile data available.</Text>
      </Box>
    );
  }

  return (
    <Box p={8} mt={8} bg="white" maxW="900px" mx="auto" borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="xl" mb={4}>
        Profile
      </Heading>
      <Stack spacing={4}>
        <Text><strong>Name:</strong> {userData.name}</Text>
        <Text><strong>Email:</strong> {userData.email}</Text>
        <Text><strong>Location:</strong> {userData.location}</Text>
        <Text><strong>Skills:</strong> {userData.skills.join(", ")}</Text>
      </Stack>
    </Box>
  );
};

export default Profile;
