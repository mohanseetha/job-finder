import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";

const Footer = () => {
  const bg = useColorModeValue("gray.100", "gray.750");
  const color = useColorModeValue("gray.600", "gray.400");
  const brand = useColorModeValue("blue.600", "blue.300");

  return (
    <Box as="footer" w="full" bg={bg} py={6}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        maxW="100vw"
        mx="auto"
        px={4}
        gap={1}
      >
        <Text
          fontWeight="bold"
          fontSize="lg"
          color={brand}
          letterSpacing="wide"
        >
          JobFinder - Your Career Companion
        </Text>
        <Text fontSize="sm" color={color}>
          &copy; 2024 JobFinder. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
