/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
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
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10,15}$/.test(phone.replace(/\D/g, ""));

const ApplicationPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [applicantData, setApplicantData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    experience: "",
    resumeLink: "",
  });

  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardTextColor = useColorModeValue("gray.600", "gray.200");
  const sectionHeadingColor = useColorModeValue("blue.600", "blue.300");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          setUserRole(role);
          if (role === "Employer") {
            toast({
              title: "Access Denied",
              description: "Employers cannot apply for jobs.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            navigate("/");
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!jobId) throw new Error("Job ID is missing.");
        const jobRef = doc(db, "jobs", jobId);
        const jobDoc = await getDoc(jobRef);
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
          if (
            currentUser &&
            jobDoc.data().applicants?.includes(currentUser.uid)
          ) {
            setAlreadyApplied(true);
          }
        } else {
          throw new Error("Job not found.");
        }
      } catch (error) {
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
  }, [jobId, navigate, toast, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setApplicantData((prev) => ({
        ...prev,
        name: currentUser.displayName || "",
        email: currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateFields = () => {
    const { name, email, phone, experience, resumeLink } = applicantData;
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(email)) newErrors.email = "Invalid email address.";
    if (!phone.trim()) newErrors.phone = "Phone is required.";
    else if (!validatePhone(phone)) newErrors.phone = "Invalid phone number.";
    if (!resumeLink.trim()) newErrors.resumeLink = "Resume link is required.";
    if (!experience.trim()) newErrors.experience = "Experience is required.";
    return newErrors;
  };

  const handleApply = async () => {
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const applicationsRef = collection(db, "applications");
      await addDoc(applicationsRef, {
        jobId: job.id,
        userId: currentUser?.uid || "anonymous",
        ...applicantData,
        appliedAt: new Date(),
      }).catch((error) => {
        console.error("Application addDoc error:", error, {
          jobId: job.id,
          userId: currentUser?.uid,
          applicantData,
        });
      });

      try {
        const jobRef = doc(db, "jobs", job.id);
        console.log("Updating job applicants array:", {
          jobId: job.id,
          jobApplicants: job.applicants,
          currentUserUid: currentUser?.uid,
        });
        await updateDoc(jobRef, {
          applicants: arrayUnion(currentUser?.uid),
        });
      } catch (error) {
        console.error("Failed to update applicants array:", error);
      }

      try {
        const userRef = doc(db, "users", currentUser?.uid);
        await updateDoc(userRef, {
          applications: arrayUnion(job.id),
        });
      } catch {}

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
        coverLetter: "",
        experience: "",
        resumeLink: "",
        status: "applied",
      });
      setAlreadyApplied(true);
      setTimeout(() => navigate("/jobs"), 1500);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Could not submit your application. Try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10} px={5}>
      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" color={sectionHeadingColor} />
        </Flex>
      ) : job ? (
        <Box
          bg={cardBgColor}
          p={{ base: 4, md: 8 }}
          rounded="lg"
          shadow="lg"
          maxW="600px"
          mx="auto"
        >
          <Heading
            as="h2"
            size="lg"
            textAlign="center"
            mb={6}
            color={sectionHeadingColor}
          >
            Apply for {job.title}
          </Heading>
          <Text fontSize="md" mb={2} color={cardTextColor}>
            Company: <strong>{job.company}</strong>
          </Text>
          <Text fontSize="md" mb={2} color={cardTextColor}>
            Location: <strong>{job.location}</strong>
          </Text>
          <Text fontSize="sm" mb={6} color={cardTextColor}>
            Posted On:{" "}
            <strong>
              {job.createdAt && job.createdAt.toDate
                ? job.createdAt.toDate().toLocaleDateString()
                : ""}
            </strong>
          </Text>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Your Name"
                name="name"
                value={applicantData.name}
                onChange={handleInputChange}
                autoComplete="name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Your Email"
                name="email"
                type="email"
                value={applicantData.email}
                onChange={handleInputChange}
                autoComplete="email"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.phone} isRequired>
              <FormLabel>Phone Number</FormLabel>
              <Input
                placeholder="Phone Number"
                name="phone"
                type="tel"
                value={applicantData.phone}
                onChange={handleInputChange}
                autoComplete="tel"
              />
              <FormErrorMessage>{errors.phone}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.resumeLink} isRequired>
              <FormLabel>Resume Link (Google Drive, Dropbox, etc.)</FormLabel>
              <Input
                placeholder="Paste a link to your resume (PDF/DOC)"
                name="resumeLink"
                type="url"
                value={applicantData.resumeLink}
                onChange={handleInputChange}
              />
              <FormErrorMessage>{errors.resumeLink}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Cover Letter</FormLabel>
              <Textarea
                placeholder="Cover Letter"
                name="coverLetter"
                value={applicantData.coverLetter}
                onChange={handleInputChange}
                rows={4}
              />
            </FormControl>
            <FormControl isInvalid={!!errors.experience} isRequired>
              <FormLabel>Experience</FormLabel>
              <Textarea
                placeholder="Experience (e.g., 3 years in software development)"
                name="experience"
                value={applicantData.experience}
                onChange={handleInputChange}
                rows={2}
              />
              <FormErrorMessage>{errors.experience}</FormErrorMessage>
            </FormControl>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleApply}
              isLoading={submitting}
              isDisabled={alreadyApplied || submitting}
              w="full"
            >
              {alreadyApplied ? "Already Applied" : "Submit Application"}
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
