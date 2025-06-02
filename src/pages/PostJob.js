import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Textarea,
  useColorModeValue,
  Flex,
  Text,
  Spinner,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const PostJob = () => {
  // All hooks at the top
  const boxBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("blue.700", "blue.200");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    skills: [],
    skillInput: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Protect route: Only allow logged-in employers
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in as an employer to post a job.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
        return;
      }
      // Check role
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== "Employer") {
        toast({
          title: "Access Denied",
          description: "Only employers can post jobs.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/");
        return;
      }
      setUser({ ...userDoc.data(), uid: firebaseUser.uid });
      setCheckingAuth(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Skill tag input logic
  const handleSkillInputChange = (e) => {
    setFormData((prev) => ({ ...prev, skillInput: e.target.value }));
  };

  const handleAddSkill = () => {
    const skill = formData.skillInput.trim();
    if (
      skill &&
      !formData.skills.includes(skill) &&
      formData.skills.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
        skillInput: "",
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, company, location, description, skills, experience } =
      formData;
    if (
      !title ||
      !company ||
      !location ||
      !description ||
      skills.length === 0 ||
      !experience
    ) {
      toast({
        title: "Validation Error",
        description: "All fields are required and at least one skill.",
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
        title,
        company,
        location,
        description,
        skills,
        experience,
        postedBy: user.uid,
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
        description: "",
        skills: [],
        skillInput: "",
        experience: "",
      });
      navigate("/profile");
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

  if (checkingAuth) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    );
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={10}
      p={{ base: 4, md: 8 }}
      borderWidth={1}
      shadow="xl"
      rounded="2xl"
      bg={boxBg}
    >
      <Heading as="h1" size="lg" textAlign="center" mb={6} color={headingColor}>
        Post a Job
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel>Job Title</FormLabel>
            <Input
              name="title"
              placeholder="Enter job title"
              value={formData.title}
              onChange={handleChange}
              size="lg"
              autoFocus
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Company</FormLabel>
            <Input
              name="company"
              placeholder="Enter company name"
              value={formData.company}
              onChange={handleChange}
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input
              name="location"
              placeholder="Enter job location"
              value={formData.location}
              onChange={handleChange}
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              placeholder="Describe the role, responsibilities, and what makes this job unique..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Required Skills</FormLabel>
            <HStack wrap="wrap" spacing={2} mb={2}>
              {formData.skills.map((skill) => (
                <Tag
                  key={skill}
                  size="lg"
                  colorScheme="blue"
                  borderRadius="full"
                  variant="solid"
                >
                  <TagLabel>{skill}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                </Tag>
              ))}
            </HStack>
            <Flex>
              <Input
                name="skillInput"
                placeholder="Type a skill and press Enter or +"
                value={formData.skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillInputKeyDown}
                size="md"
                flex={1}
              />
              <Button
                ml={2}
                leftIcon={<Icon as={FaPlus} />}
                colorScheme="blue"
                onClick={handleAddSkill}
                isDisabled={
                  !formData.skillInput.trim() ||
                  formData.skills.includes(formData.skillInput.trim())
                }
              >
                Add
              </Button>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Add up to 10 skills. Press Enter or click Add after each skill.
            </Text>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Experience (Years)</FormLabel>
            <Input
              name="experience"
              placeholder="Enter years of experience"
              value={formData.experience}
              onChange={handleChange}
              size="lg"
              type="number"
              min={0}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={loading}
            loadingText="Posting..."
            w="full"
            mt={2}
          >
            Post Job
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default PostJob;
