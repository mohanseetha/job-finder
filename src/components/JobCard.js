import React from "react";
import {
  Box,
  Text,
  Badge,
  Flex,
  Button,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.700");
  const titleCol = useColorModeValue("blue.600", "blue.300");
  const companyCol = useColorModeValue("gray.700", "gray.200");
  const locationCol = useColorModeValue("gray.500", "gray.400");
  const expCol = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      boxShadow="lg"
      bg={cardBg}
      _hover={{ boxShadow: "2xl" }}
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      maxWidth="1200px"
      margin="auto"
      borderColor={borderCol}
      mb={4}
    >
      <Stack spacing={3} flex="2" mr={6} width="full">
        <Text fontSize="2xl" fontWeight="bold" color={titleCol} noOfLines={1}>
          {job.title}
        </Text>
        <Text fontSize="lg" color={companyCol} noOfLines={1}>
          {job.company}
        </Text>
        <Text fontSize="md" color={locationCol} noOfLines={1}>
          {job.location}
        </Text>
      </Stack>
      <Flex direction="column" flex="3" justify="center" align="flex-start">
        <Flex wrap="wrap" mb={3}>
          {job.skills &&
            job.skills.map((skill, index) => (
              <Badge
                key={index}
                colorScheme="green"
                mr={2}
                mb={2}
                fontSize="sm"
              >
                {skill}
              </Badge>
            ))}
        </Flex>
        <Text fontSize="sm" color={expCol} mb={3}>
          <strong>{job.experience}</strong> years of experience required
        </Text>
      </Flex>
      <Button
        colorScheme="blue"
        size="lg"
        onClick={() => navigate(`/job-details/${job.id}`)}
        mt={4}
        ml={4}
        height="50px"
        fontSize="lg"
      >
        View Details
      </Button>
    </Box>
  );
};

export default JobCard;
