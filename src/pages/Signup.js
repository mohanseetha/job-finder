import React, { useState } from "react";
import { Box, Heading, Input, Button, Stack, Text, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !name || !location || !skills) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name,
        email,
        location,
        skills: skills.split(",").map((skill) => skill.trim()),
      });

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEmail("");
      setPassword("");
      setName("");
      setLocation("");
      setSkills("");

    } catch (error) {
      console.error("Error creating account: ", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} mt={8} maxW="500px" mx="auto" borderWidth={1} borderRadius="md" boxShadow="lg">
      <Heading as="h2" size="xl" mb={4} textAlign="center">
        Create Your Account
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="location">Location</FormLabel>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="skills">Skills (comma separated)</FormLabel>
            <Input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Enter your skills (e.g., JavaScript, React, Node.js)"
            />
          </FormControl>

          <Button
            colorScheme="blue"
            size="lg"
            type="submit"
            isLoading={loading}
            loadingText="Creating Account"
            width="full"
          >
            Sign Up
          </Button>
        </Stack>
      </form>
      <Text mt={4} fontSize="sm" textAlign="center">
        Already have an account?{" "}
        <Button
            variant="link"
            colorScheme="blue"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
      </Text>
    </Box>
  );
};

export default SignupForm;
