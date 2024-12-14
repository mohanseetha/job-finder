import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  SimpleGrid,
  Stack,
  useColorModeValue,
  Spinner,
  Badge,
  Image
} from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import banner from "../assets/banner.gif";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, "jobs");
        const jobsSnapshot = await getDocs(jobsCollection);
        const jobsList = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);
        setFilteredJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  };

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardTextColor = useColorModeValue("gray.600", "gray.200");
  const sectionHeadingColor = useColorModeValue("blue.600", "blue.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const jobsToDisplay = filteredJobs.slice(0, 9);

  return (
    <Box bg={bgColor} minH="100vh" py={10} px={5}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        maxW="1200px"
        mx="auto"
        mb={12}
      >
        <VStack align="start" spacing={6} maxW="lg">
          <Heading
            as="h1"
            size="2xl"
            fontWeight="bold"
            color={sectionHeadingColor}
          >
            Find Your Dream Job Today
          </Heading>
          <Text fontSize="lg" color={cardTextColor}>
            Discover thousands of job opportunities from top companies. Join us
            and take the first step toward building the career of your dreams.
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => navigate("/jobs")}
          >
            Explore Jobs
          </Button>
        </VStack>
        <Image src={banner} aspectRatio={4/3} width={500} borderRadius={10}></Image>
      </Flex>

      <Box bg={cardBgColor} p={6} rounded="lg" shadow="lg" maxW="1200px" mx="auto" mb={12}>
        <Heading as="h2" size="lg" textAlign="center" mb={6} color={sectionHeadingColor}>
          Search Jobs
        </Heading>
        <Flex as="form" gap={4} onSubmit={(e) => e.preventDefault()}>
          <Input
            placeholder="Job title, keywords, or company"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button colorScheme="blue" onClick={handleSearch}>
            Search
          </Button>
        </Flex>
      </Box>

      <Box bg={cardBgColor} p={8} rounded="lg" shadow="lg" maxW="1200px" mx="auto" mb={12}>
        <Heading as="h2" size="lg" textAlign="center" mb={6} color={sectionHeadingColor}>
          Featured Jobs
        </Heading>
        {loading ? (
          <Flex justify="center">
            <Spinner size="xl" color={sectionHeadingColor} />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {jobsToDisplay.length > 0 ? (
              jobsToDisplay.map((job) => (
                <Stack
                  key={job.id}
                  p={6}
                  rounded="lg"
                  shadow="md"
                  border="1px"
                  borderColor={borderColor}
                  bg={cardBgColor}
                >
                  <Heading size="md" color={sectionHeadingColor}>
                    {job.title}
                  </Heading>
                  <Text color={cardTextColor}>{job.company}</Text>
                  <Text color={cardTextColor}>Location: {job.location}</Text>
                  <Text color={cardTextColor}>Skills: {job.skills.map((skill) => {
                    return (
                      <Badge key={skill} colorScheme="green" mr={2} mb={2} fontSize="sm">
                        {skill}
                      </Badge>
                    );
                  })}</Text>
                  <Text color={cardTextColor}>Exp: {job.experience} years</Text>
                  <Button colorScheme="blue" size="sm" onClick={() => navigate(`/job-details/${job.id}`)}>
                    View Details
                  </Button>
                </Stack>
              ))
            ) : (
              <Text color={cardTextColor}>No jobs found for your search criteria.</Text>
            )}
          </SimpleGrid>
        )}
      </Box>

      <Box textAlign="center" color={cardTextColor} py={6}>
        <Text>© 2024 JobFinder. All rights reserved.</Text>
      </Box>
    </Box>
  );
};

export default Home;
