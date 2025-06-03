import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  VStack,
  Collapse,
  Spacer,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { CgProfile } from "react-icons/cg";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Jobs", path: "/jobs" },
  { name: "About", path: "/about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBgColor = useColorModeValue("gray.200", "gray.700");
  const logoColor = useColorModeValue("blue.600", "blue.300");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      px={4}
      shadow="sm"
      borderBottomWidth="1px"
      zIndex={10}
      position="sticky"
      top={0}
    >
      <Flex h={16} align="center" maxW="1200px" mx="auto">
        <Box
          fontSize="2xl"
          fontWeight="bold"
          color={logoColor}
          as={Link}
          to="/"
          _hover={{ textDecoration: "none" }}
        >
          JobFinder
        </Box>
        {/* Desktop Nav */}
        <HStack
          as="nav"
          spacing={4}
          ml={8}
          display={{ base: "none", md: "flex" }}
        >
          {NAV_LINKS.map((link) => (
            <ChakraLink
              as={Link}
              key={link.name}
              to={link.path}
              px={3}
              py={2}
              rounded="md"
              fontWeight={location.pathname === link.path ? "bold" : "normal"}
              bg={
                location.pathname === link.path ? hoverBgColor : "transparent"
              }
              _hover={{ textDecoration: "none", bg: hoverBgColor }}
            >
              {link.name}
            </ChakraLink>
          ))}
        </HStack>
        <Spacer />
        <HStack spacing={2}>
          <IconButton
            size="md"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            aria-label="Toggle Theme"
            onClick={toggleColorMode}
            variant="ghost"
          />
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="ghost"
                minW={0}
                aria-label="User menu"
              >
                <CgProfile size={28} />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button colorScheme="blue" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </HStack>
        {/* Mobile Menu Button */}
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: "none" }}
          ml={2}
          onClick={() => setIsOpen(!isOpen)}
        />
      </Flex>
      {/* Mobile Nav */}
      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: "none" }}>
          <VStack as="nav" spacing={1} align="stretch">
            {NAV_LINKS.map((link) => (
              <ChakraLink
                as={Link}
                key={link.name}
                to={link.path}
                px={3}
                py={2}
                rounded="md"
                fontWeight={location.pathname === link.path ? "bold" : "normal"}
                bg={
                  location.pathname === link.path ? hoverBgColor : "transparent"
                }
                _hover={{ textDecoration: "none", bg: hoverBgColor }}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </ChakraLink>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;
