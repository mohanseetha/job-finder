import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Stack,
  Badge,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import JobCard from "../components/JobCard";
import { FaMapMarkerAlt, FaBuilding, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MobileJobCard = ({ job }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const navigate = useNavigate();

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      boxShadow="md"
      p={4}
      mb={3}
      w="100%"
    >
      <Text fontWeight="bold" fontSize="lg" color={textColor} mb={1}>
        {job.title}
      </Text>
      <Flex
        align="center"
        fontSize="sm"
        color={labelColor}
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <FaBuilding style={{ marginRight: 4 }} />
        <Text as="span">{job.company}</Text>
        <FaMapMarkerAlt style={{ margin: "0 4px 0 12px" }} />
        <Text as="span">{job.location}</Text>
      </Flex>
      <Flex gap={2} mb={2} flexWrap="wrap">
        {job.skills?.slice(0, 3).map((skill, idx) => (
          <Badge key={idx} colorScheme="green" fontSize="0.8em">
            {skill}
          </Badge>
        ))}
        {job.skills?.length > 3 && (
          <Badge colorScheme="gray" fontSize="0.8em">
            +{job.skills.length - 3} more
          </Badge>
        )}
      </Flex>
      <Flex align="center" fontSize="sm" color={labelColor} mb={2} gap={4}>
        <Flex align="center">
          <FaMoneyBillWave style={{ marginRight: 4 }} />
          <Text>{job.salary ? `₹${job.salary}/mo` : "Salary N/A"}</Text>
        </Flex>
        <Text>| {job.jobType}</Text>
      </Flex>
      <Text fontSize="sm" color={textColor} noOfLines={2} mb={2}>
        {job.description}
      </Text>
      <Button
        size="sm"
        colorScheme="blue"
        w="full"
        onClick={() => navigate(`/jobs/${job.id}`)}
      >
        View Details
      </Button>
    </Box>
  );
};

const JobListings = () => {
  const [jobs, setJobs] = useState([]);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const noJobsColor = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    const fetchJobs = async () => {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobList);
    };

    fetchJobs();
  }, []);

  return (
    <Box
      px={{ base: 1, md: 6 }}
      py={{ base: 3, md: 8 }}
      bg={bgColor}
      minH="100vh"
    >
      <Text
        fontSize={{ base: "2xl", md: "3xl" }}
        fontWeight="bold"
        mb={{ base: 4, md: 6 }}
        color={headingColor}
        textAlign="center"
      >
        Featured Job Listings
      </Text>
      {jobs.length > 0 ? (
        <>
          {/* Desktop: Original Flex grid with JobCard */}
          <Flex
            wrap="wrap"
            justify="center"
            align="flex-start"
            gap={6}
            display={{ base: "none", md: "flex" }}
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} textColor={textColor} />
            ))}
          </Flex>
          {/* Mobile: Custom mobile-optimized cards */}
          <Stack
            spacing={3}
            display={{ base: "flex", md: "none" }}
            align="stretch"
          >
            {jobs.map((job) => (
              <MobileJobCard key={job.id} job={job} />
            ))}
          </Stack>
        </>
      ) : (
        <Box
          minH="40vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color={noJobsColor} fontSize={{ base: "md", md: "lg" }}>
            No jobs available
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default JobListings;
