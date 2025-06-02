import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Stack,
  Text,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  useColorModeValue,
  Select as ChakraSelect,
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const SKILL_OPTIONS = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "React", label: "React" },
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Django", label: "Django" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Firebase", label: "Firebase" },
  { value: "SQL", label: "SQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "AWS", label: "AWS" },
  { value: "HTML", label: "HTML" },
  { value: "CSS", label: "CSS" },
  { value: "Tailwind", label: "Tailwind" },
  { value: "Chakra UI", label: "Chakra UI" },
  { value: "Redux", label: "Redux" },
  { value: "Express", label: "Express" },
  { value: "C++", label: "C++" },
  { value: "Java", label: "Java" },
  { value: "Go", label: "Go" },
  { value: "Flutter", label: "Flutter" },
  { value: "Other", label: "Other" },
];

const INDUSTRY_OPTIONS = [
  "Information Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Other",
];

const SignupForm = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  // Job Seeker
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  // Employer
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const customSkillInputRef = useRef(null);

  const selectBg = useColorModeValue("white", "#2D3748");
  const selectText = useColorModeValue("gray.700", "gray.200");
  const multiBg = useColorModeValue("blue.50", "blue.900");
  const multiText = useColorModeValue("blue.700", "blue.200");
  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const selectStyles = {
    control: (base) => ({
      ...base,
      background: selectBg,
      color: selectText,
    }),
    menu: (base) => ({
      ...base,
      background: selectBg,
      color: selectText,
    }),
    input: (base) => ({
      ...base,
      color: selectText,
    }),
    singleValue: (base) => ({
      ...base,
      color: selectText,
    }),
    multiValue: (base) => ({
      ...base,
      background: multiBg,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: multiText,
    }),
  };

  useEffect(() => {
    if (
      skills.some((skill) => skill.value === "Other") &&
      customSkillInputRef.current
    ) {
      customSkillInputRef.current.focus();
    }
  }, [skills]);

  const isOtherSelected = skills.some((skill) => skill.value === "Other");

  const handleSkillsChange = (selected) => {
    setSkills(selected || []);
    if (!selected?.some((skill) => skill.value === "Other")) {
      setCustomSkill("");
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() === "") return;

    const filteredSkills = skills.filter((skill) => skill.value !== "Other");

    setSkills([
      ...filteredSkills,
      { value: customSkill.trim(), label: customSkill.trim() },
    ]);
    setCustomSkill("");
  };

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomSkill();
    }
  };

  // Validation
  const isJobSeeker =
    role === "jobseeker" || role === "Job Seeker" || role === "employee";
  const isEmployer =
    role === "employer" || role === "Employer" || role === "recruiter";

  const isSignUpDisabled =
    !email ||
    !password ||
    !name ||
    !location ||
    !role ||
    (isJobSeeker &&
      (skills.length < 3 || (isOtherSelected && customSkill.trim() === ""))) ||
    (isEmployer && (!orgName || !industry || !website));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUpDisabled) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = userCredential;

      let userData = {
        name,
        email,
        location,
        role: isJobSeeker ? "Job Seeker" : "Employer",
      };

      if (isJobSeeker) {
        userData.skills = skills
          .filter((skill) => skill.value !== "Other")
          .map((skill) => skill.value);
      } else if (isEmployer) {
        userData.organization = orgName;
        userData.industry = industry;
        userData.website = website;
      }

      await setDoc(doc(db, "users", user.uid), userData);

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEmail("");
      setPassword("");
      setName("");
      setLocation("");
      setSkills([]);
      setCustomSkill("");
      setOrgName("");
      setIndustry("");
      setWebsite("");
      setRole("");
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Box
        p={8}
        maxW="500px"
        w="100%"
        borderWidth={1}
        borderRadius="md"
        boxShadow="lg"
        bg={bg}
      >
        <Heading as="h2" size="xl" mb={4} textAlign="center" color={textColor}>
          Create Your Account
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="role">Account Type</FormLabel>
              <ChakraSelect
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Select account type"
              >
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </ChakraSelect>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="location">Location</FormLabel>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
              />
            </FormControl>

            {/* Job Seeker Fields */}
            {isJobSeeker && (
              <FormControl isRequired>
                <FormLabel htmlFor="skills">Skills (min 3)</FormLabel>
                <Select
                  id="skills"
                  isMulti
                  name="skills"
                  options={SKILL_OPTIONS}
                  value={skills}
                  onChange={handleSkillsChange}
                  placeholder="Select your skills"
                  closeMenuOnSelect={false}
                  styles={selectStyles}
                />
                {isOtherSelected && (
                  <Stack mt={2} spacing={1}>
                    <Input
                      ref={customSkillInputRef}
                      placeholder="Type your custom skill and press Enter or Add"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={handleCustomSkillKeyDown}
                      autoFocus
                    />
                    <Flex align="center" gap={2}>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={handleAddCustomSkill}
                        isDisabled={customSkill.trim() === ""}
                      >
                        Add
                      </Button>
                      <Text fontSize="xs" color="gray.500">
                        Enter your unique skill, then click Add or press Enter.
                      </Text>
                    </Flex>
                  </Stack>
                )}
                {skills.length > 0 && skills.length < 3 && (
                  <Text color="red.400" fontSize="sm" mt={2}>
                    Please select at least 3 skills.
                  </Text>
                )}
              </FormControl>
            )}

            {/* Employer Fields */}
            {isEmployer && (
              <>
                <FormControl isRequired>
                  <FormLabel htmlFor="orgName">Organization Name</FormLabel>
                  <Input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter your organization name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="industry">Industry</FormLabel>
                  <ChakraSelect
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Select industry"
                  >
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </ChakraSelect>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="website">Company Website</FormLabel>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </FormControl>
              </>
            )}

            <Button
              colorScheme="blue"
              size="lg"
              type="submit"
              isLoading={loading}
              loadingText="Creating Account"
              width="full"
              isDisabled={isSignUpDisabled}
            >
              Sign Up
            </Button>
          </Stack>
        </form>

        <Text mt={4} textAlign="center">
          Already have an account?{" "}
          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignupForm;
