import React from "react";
import { Box, Text, Badge, Flex, Button, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      boxShadow="lg"
      _hover={{ boxShadow: "2xl" }}
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      maxWidth="1200px"
      margin="auto" 
      borderColor="gray.200"
      mb={4}
    >
      <Stack spacing={3} flex="2" mr={6} width="full">
        <Text fontSize="2xl" fontWeight="bold" color="blue.500" noOfLines={1}>
          {job.title}
        </Text>
        <Text fontSize="lg" color="gray.700" noOfLines={1}>
          {job.company}
        </Text>
        <Text fontSize="md" color="gray.500" noOfLines={1}>
          {job.location}
        </Text>
      </Stack>
      <Flex direction="column" flex="3" justify="center" align="flex-start">
        <Flex wrap="wrap" mb={3}>
          {job.skills && job.skills.map((skill, index) => (
            <Badge key={index} colorScheme="green" mr={2} mb={2} fontSize="sm">
              {skill}
            </Badge>
          ))}
        </Flex>
        <Text fontSize="sm" color="gray.500" mb={3}>
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
