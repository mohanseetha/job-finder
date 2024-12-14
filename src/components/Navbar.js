import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBgColor = useColorModeValue("gray.200", "gray.700");
  const logoColor = useColorModeValue("blue.600", "blue.300");

  const links = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "About", path: "/about" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <Box bg={bgColor} px={4} shadow="sm" borderBottomWidth="1px">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        maxW="1200px"
        mx="auto"
      >
        <HStack spacing={8} alignItems="center">
          <Box
            fontSize="2xl"
            fontWeight="bold"
            cursor="pointer"
            color={logoColor}
            onClick={() => navigate("/")}
          >
            JobFinder
          </Box>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                px={2}
                py={1}
                rounded="md"
                _hover={{
                  textDecoration: "none",
                  bg: hoverBgColor,
                }}
              >
                {link.name}
              </Link>
            ))}
          </HStack>
        </HStack>
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Toggle Menu"
          display={{ md: "none" }}
          onClick={toggleMenu}
        />
        <Flex alignItems="center" ml={4}>
          <IconButton
            size="md"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            aria-label="Toggle Theme"
            onClick={toggleColorMode}
            mr={4}
          />
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
              >
                <Avatar size="sm" name={user.displayName || "User"} src={user.photoURL || "https://bit.ly/broken-link"} />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button colorScheme="blue" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Flex>
      </Flex>
      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <HStack as="nav" spacing={4} flexDirection="column">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                px={2}
                py={1}
                rounded="md"
                _hover={{
                  textDecoration: "none",
                  bg: hoverBgColor,
                }}
              >
                {link.name}
              </Link>
            ))}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
