import React, { useEffect, useState } from "react";
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
  const auth = getAuth();
  const [userRole, setUserRole] = useState(null);

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

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("blue.700", "blue.300");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.200");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, [auth]);

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
      p={{ base: 3, sm: 4, md: 8 }}
      mt={{ base: 4, md: 8 }}
      mb={{ base: 4, md: 8 }}
      maxW="3xl"
      mx="auto"
      borderWidth={1}
      borderRadius="2xl"
      boxShadow="xl"
      bg={cardBg}
      borderColor={cardBorder}
      transition="background 0.2s"
    >
      <Stack spacing={{ base: 4, md: 6 }}>
        <Box>
          <Heading
            as="h2"
            size={{ base: "lg", md: "xl" }}
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
        <Box>
          <Text fontWeight="semibold" color={labelColor} mb={1}>
            Skills:
          </Text>
          <Flex wrap="wrap" gap={2}>
            {job.skills?.map((skill, idx) => (
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
        </Box>

        {/* Job Info Row */}
        <Flex
          gap={{ base: 4, md: 6 }}
          flexWrap="wrap"
          direction={{ base: "column", sm: "row" }}
        >
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaBriefcase} mr={1} />
              Experience Required:
            </Text>
            <Text>{job.experience} years</Text>
          </Box>
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaMoneyBillWave} mr={1} />
              Salary:
            </Text>
            <Text>
              {job.salary ? `₹${job.salary} per month` : "Not specified"}
            </Text>
          </Box>
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaBriefcase} mr={1} />
              Job Type:
            </Text>
            <Text>{job.jobType}</Text>
          </Box>
          <Box minW="150px">
            <Text fontWeight="semibold" color={labelColor} mb={1}>
              <Icon as={FaCalendarAlt} mr={1} />
              Posted On:
            </Text>
            <Text>{job.postedOn}</Text>
          </Box>
        </Flex>

        <Divider borderColor={sectionBg} />

        {/* Description */}
        <Box bg={sectionBg} p={4} borderRadius="lg">
          <Text fontWeight="semibold" color={labelColor} mb={2}>
            Description:
          </Text>
          <Text color={textColor}>{job.description}</Text>
        </Box>

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <Box>
            <Text fontWeight="semibold" color={labelColor} mb={2}>
              Responsibilities:
            </Text>
            <List styleType="disc" pl={6} color={textColor}>
              {job.responsibilities.map((responsibility, idx) => (
                <ListItem key={idx}>{responsibility}</ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Qualifications */}
        {job.qualifications?.length > 0 && (
          <Box>
            <Text fontWeight="semibold" color={labelColor} mb={2}>
              Qualifications:
            </Text>
            <List styleType="disc" pl={6} color={textColor}>
              {job.qualifications.map((qualification, idx) => (
                <ListItem key={idx}>{qualification}</ListItem>
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
            onClick={() => navigate(`/application/${jobId}`)}
            disabled={alreadyApplied}
            _hover={alreadyApplied ? { cursor: "not-allowed" } : {}}
          >
            {alreadyApplied ? "Already Applied" : "Apply Now"}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default JobDetails;
