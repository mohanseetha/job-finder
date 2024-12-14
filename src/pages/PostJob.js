import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    skills: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, company, location, skills, experience } = formData;
    if (!title || !company || !location || !skills || !experience) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const jobsCollection = collection(db, "jobs");
      await addDoc(jobsCollection, {
        ...formData,
        skills: skills.split(",").map((skill) => skill.trim()), 
        experience: experience, 
        createdAt: new Date(),
      });

      toast({
        title: "Job Posted",
        description: "Your job has been posted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        title: "",
        company: "",
        location: "",
        skills: "",
        experience: "",
      });
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: "An error occurred while posting the job.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={8} p={6} borderWidth={1} shadow="lg" rounded="lg">
      <Heading as="h1" size="lg" textAlign="center" mb={6}>
        Post a Job
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Job Title</FormLabel>
            <Input
              name="title"
              placeholder="Enter job title"
              value={formData.title}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Company</FormLabel>
            <Input
              name="company"
              placeholder="Enter company name"
              value={formData.company}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input
              name="location"
              placeholder="Enter job location"
              value={formData.location}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Required Skills</FormLabel>
            <Input
              name="skills"
              placeholder="Enter required skills (comma-separated)"
              value={formData.skills}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Experience (Years)</FormLabel>
            <Input
              name="experience"
              placeholder="Enter years of experience"
              value={formData.experience}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Posting..."
            w="full"
          >
            Post Job
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default PostJob;
