import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box textAlign="center" py={20} px={6}>
      <Heading as="h1" size="2xl" mb={4}>
        404 - Page Not Found
      </Heading>
      <Text fontSize="xl" mb={6}>
        Oops! The page you're looking for does not exist.
      </Text>
      <Button colorScheme="blue" onClick={handleGoHome}>
        Go to Home Page
      </Button>
    </Box>
  );
};

export default NotFound;
