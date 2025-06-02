import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful.",
        description: "Welcome back!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging in.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Box
        maxW="md"
        w="100%"
        p={8}
        borderWidth={1}
        borderRadius="md"
        boxShadow="lg"
        bg={bg}
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb={4}
          textAlign="center"
          color={textColor}
        >
          Log In to Your Account
        </Text>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button colorScheme="blue" isLoading={loading} onClick={handleLogin}>
            Log In
          </Button>
          <Text
            fontSize="sm"
            textAlign="center"
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Don't have an account?{" "}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Login;
