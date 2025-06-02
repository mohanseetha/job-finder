import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  Textarea,
  Button,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { FaBriefcase, FaUserAlt, FaRegLightbulb } from "react-icons/fa";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

const About = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const sectionHeadingColor = useColorModeValue("blue.600", "blue.300");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const boxShadow = useColorModeValue("lg", "dark-lg");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format.";
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await addDoc(collection(db, "contacts"), formData);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form: ", error);
      toast({
        title: "Error submitting form",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10} px={5}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        maxW="1200px"
        mx="auto"
      >
        <VStack spacing={6} mb={12} textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            fontWeight="bold"
            color={sectionHeadingColor}
          >
            About JobFinder
          </Heading>
          <Text fontSize="lg" color="gray.500">
            JobFinder is dedicated to connecting talented individuals with top
            companies. Whether you're seeking your dream job or the perfect
            candidate, we're here to help.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} mb={12}>
          <Box bg={cardBgColor} p={6} rounded="lg" shadow={boxShadow}>
            <Icon
              as={FaBriefcase}
              w={10}
              h={10}
              color={sectionHeadingColor}
              mb={4}
            />
            <Heading size="md" mb={2} color={sectionHeadingColor}>
              Trusted Employers
            </Heading>
            <Text color={textColor}>
              Access thousands of verified job listings from top-rated companies
              around the world.
            </Text>
          </Box>

          <Box bg={cardBgColor} p={6} rounded="lg" shadow={boxShadow}>
            <Icon
              as={FaUserAlt}
              w={10}
              h={10}
              color={sectionHeadingColor}
              mb={4}
            />
            <Heading size="md" mb={2} color={sectionHeadingColor}>
              Personalized Recommendations
            </Heading>
            <Text color={textColor}>
              Get tailored job recommendations based on your skills,
              preferences, and experience.
            </Text>
          </Box>

          <Box bg={cardBgColor} p={6} rounded="lg" shadow={boxShadow}>
            <Icon
              as={FaRegLightbulb}
              w={10}
              h={10}
              color={sectionHeadingColor}
              mb={4}
            />
            <Heading size="md" mb={2} color={sectionHeadingColor}>
              Career Guidance
            </Heading>
            <Text color={textColor}>
              Our platform helps you explore your career path with helpful tips
              and job search resources.
            </Text>
          </Box>
        </SimpleGrid>

        <Box textAlign="center" mt={2} mb={8}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => (window.location.href = "/jobs")}
          >
            Start Your Job Search Today
          </Button>
        </Box>

        <Box
          bg={cardBgColor}
          p={8}
          rounded="lg"
          shadow="lg"
          maxW="600px"
          width="100%"
        >
          <Heading
            as="h2"
            size="lg"
            textAlign="center"
            mb={6}
            color={sectionHeadingColor}
          >
            Contact Us
          </Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  borderColor={inputBorderColor}
                  focusBorderColor="blue.400"
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  borderColor={inputBorderColor}
                  focusBorderColor="blue.400"
                />
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={errors.message}>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  borderColor={inputBorderColor}
                  focusBorderColor="blue.400"
                />
                {errors.message && (
                  <FormErrorMessage>{errors.message}</FormErrorMessage>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Submitting"
                width="full"
              >
                Submit
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Box>
  );
};

export default About;
