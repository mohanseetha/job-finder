import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  Textarea,
  Button,
  useToast,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

const ApplicationPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicantData, setApplicantData] = useState({
    name: "",
    email: "",
    phone: "",
    resumeLink: "",
    coverLetter: "",
    experience: "",
    skills: "",
  });
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardTextColor = useColorModeValue("gray.600", "gray.200");
  const sectionHeadingColor = useColorModeValue("blue.600", "blue.300");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!jobId) {
          throw new Error("Job ID is missing.");
        }

        const jobRef = doc(db, "jobs", jobId);
        const jobDoc = await getDoc(jobRef);

        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          throw new Error("Job not found.");
        }
      } catch (error) {
        console.error("Error fetching job details:", error.message);
        toast({
          title: "Error",
          description: error.message || "Unable to fetch job details.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = async () => {
    const { name, email, phone, resumeLink, coverLetter, experience, skills } = applicantData;
  
    if (!name || !email || !phone || !resumeLink || !experience || !skills) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const applicationsRef = collection(db, "applications");
      await addDoc(applicationsRef, {
        jobId: job.id,
        userId: currentUser?.uid || "anonymous",
        name,
        email,
        phone,
        resumeLink,
        coverLetter,
        experience,
        skills,
        appliedAt: new Date(),
      });
  
      // Update job document to include the applicant's userId in the applicants array
      try {
        const jobRef = doc(db, "jobs", job.id);
        await updateDoc(jobRef, {
          applicants: arrayUnion(currentUser?.uid), // Adds the userId to the applicants array if it doesn't exist, or union if it does
        });
      } catch (error) {
        console.error("Error updating job applicants:", error);
      }
  
      // Update user's document to include the jobId in the applications array
      try {
        const userRef = doc(db, "users", currentUser?.uid);
        await updateDoc(userRef, {
          applications: arrayUnion(job.id), // Adds the jobId to the applications array if it doesn't exist, or union if it does
        });
      } catch (error) {
        console.error("Error updating user applications:", error);
      }
  
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      setApplicantData({
        name: "",
        email: "",
        phone: "",
        resumeLink: "",
        coverLetter: "",
        experience: "",
        skills: "",
      });
  
      navigate("/jobs");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Error",
        description: "Could not submit your application. Try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box bg={bgColor} minH="100vh" py={10} px={5}>
      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" color={sectionHeadingColor} />
        </Flex>
      ) : job ? (
        <Box bg={cardBgColor} p={8} rounded="lg" shadow="lg" maxW="600px" mx="auto">
          <Heading as="h2" size="lg" textAlign="center" mb={6} color={sectionHeadingColor}>
            Apply for {job.title}
          </Heading>
          <Text fontSize="md" mb={4} color={cardTextColor}>
            Company: <strong>{job.company}</strong>
          </Text>
          <Text fontSize="md" mb={8} color={cardTextColor}>
            Location: <strong>{job.location}</strong>
          </Text>
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Your Name"
              name="name"
              value={applicantData.name}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Your Email"
              name="email"
              type="email"
              value={applicantData.email}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Phone Number"
              name="phone"
              type="tel"
              value={applicantData.phone}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Link to Resume"
              name="resumeLink"
              value={applicantData.resumeLink}
              onChange={handleInputChange}
            />
            <Textarea
              placeholder="Cover Letter"
              name="coverLetter"
              value={applicantData.coverLetter}
              onChange={handleInputChange}
            />
            <Textarea
              placeholder="Experience (e.g., 3 years in software development)"
              name="experience"
              value={applicantData.experience}
              onChange={handleInputChange}
            />
            <Textarea
              placeholder="Skills (e.g., React, Firebase, Python)"
              name="skills"
              value={applicantData.skills}
              onChange={handleInputChange}
            />
            <Button colorScheme="blue" size="lg" onClick={handleApply}>
              Submit Application
            </Button>
          </VStack>
        </Box>
      ) : (
        <Flex justify="center">
          <Text fontSize="lg" color={sectionHeadingColor}>
            Job details could not be loaded.
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default ApplicationPage;
