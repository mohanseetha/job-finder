import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  ListItem,
  List,
  Stack,
  Flex,
  Divider,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBriefcase,
} from "react-icons/fa";

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("blue.700", "blue.300");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const textColor = useColorModeValue("gray.700", "gray.200");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobDoc = doc(db, "jobs", jobId);
        const jobSnapshot = await getDoc(jobDoc);
        if (jobSnapshot.exists()) {
          setJob(jobSnapshot.data());
        } else {
          setJob(null);
        }
      } catch (error) {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Spinner size="xl" thickness="4px" color="blue.400" />
      </Flex>
    );
  }

  if (!job) {
    return (
      <Box textAlign="center" py={20} px={4}>
        <Heading size="lg" color="red.400">
          Job not found
        </Heading>
        <Button
          mt={6}
          onClick={() => navigate(-1)}
          colorScheme="blue"
          variant="outline"
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const alreadyApplied = job?.applicants?.includes(currentUser?.uid);

  return (
    <Box
      p={{ base: 2, sm: 3, md: 8 }}
      mt={{ base: 2, md: 8 }}
      mb={{ base: 4, md: 8 }}
      maxW="3xl"
      mx="auto"
      borderRadius={{ base: "lg", md: "2xl" }}
      boxShadow={{ base: "md", md: "xl" }}
      bg={cardBg}
      borderWidth={{ base: 0, md: 1 }}
      borderColor={cardBorder}
      transition="background 0.2s"
    >
      <Stack spacing={{ base: 4, md: 6 }}>
        {/* Title & Company/Location */}
        <Box>
          <Heading
            as="h2"
            size={{ base: "md", md: "xl" }}
            color={headingColor}
            mb={2}
            wordBreak="break-word"
          >
            {job.title}
          </Heading>
          <Flex
            align="center"
            gap={3}
            color={labelColor}
            fontSize={{ base: "sm", md: "md" }}
            flexWrap="wrap"
          >
            <Icon as={FaBuilding} mr={1} />
            <Text as="span" fontWeight="medium">
              {job.company}
            </Text>
            <Divider
              orientation="vertical"
              h="20px"
              borderColor={labelColor}
              display={{ base: "none", sm: "block" }}
            />
            <Icon as={FaMapMarkerAlt} mr={1} />
            <Text as="span">{job.location}</Text>
          </Flex>
        </Box>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <Flex wrap="wrap" gap={2}>
            {job.skills.map((skill, idx) => (
              <Badge
                key={idx}
                colorScheme="green"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="0.95em"
                fontWeight="bold"
                boxShadow="sm"
              >
                {skill}
              </Badge>
            ))}
          </Flex>
        )}

        {/* Job Info Row */}
        <Flex
          gap={{ base: 2, md: 6 }}
          flexWrap="wrap"
          direction={{ base: "column", sm: "row" }}
          borderBottom="1px solid"
          borderColor={borderColor}
          pb={2}
        >
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaBriefcase} mr={1} />
              Experience:
            </Text>
            <Text color={textColor}>{job.experience}+ years</Text>
          </Box>
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaMoneyBillWave} mr={1} />
              Salary:
            </Text>
            <Text color={textColor}>
              {job.salary ? `₹${job.salary} per month` : "Not specified"}
            </Text>
          </Box>
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaCalendarAlt} mr={1} />
              Posted On:
            </Text>
            <Text color={textColor}>
              {job.createdAt && job.createdAt.toDate
                ? job.createdAt.toDate().toLocaleDateString()
                : ""}
            </Text>
          </Box>
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaBriefcase} mr={1} />
              Job Type:
            </Text>
            <Text color={textColor}>{job.jobType || "N/A"}</Text>
          </Box>
        </Flex>

        {/* Description */}
        <Box>
          <Text fontWeight="semibold" color={labelColor} mb={2}>
            Description
          </Text>
          <Text color={textColor}>{job.description}</Text>
        </Box>

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <Box>
            <Text fontWeight="semibold" color={labelColor} mb={2}>
              Responsibilities
            </Text>
            <List styleType="disc" pl={6} color={textColor}>
              {job.responsibilities.map((responsibility, idx) => (
                <ListItem key={idx}>{responsibility}</ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <Box>
            <Text fontWeight="semibold" color={labelColor} mb={2}>
              Requirements
            </Text>
            <List styleType="disc" pl={6} color={textColor}>
              {job.requirements.map((requirement, idx) => (
                <ListItem key={idx}>{requirement}</ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Apply Button */}
        {userRole === "Job Seeker" && (
          <Button
            colorScheme={alreadyApplied ? "gray" : "blue"}
            size="lg"
            w="full"
            mt={2}
            onClick={() => navigate(`/application/${jobId}`)}
            disabled={alreadyApplied}
            _hover={alreadyApplied ? { cursor: "not-allowed" } : {}}
            fontWeight="bold"
            fontSize="lg"
            borderRadius="xl"
            shadow="md"
          >
            {alreadyApplied ? "Already Applied" : "Apply Now"}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default JobDetails;
