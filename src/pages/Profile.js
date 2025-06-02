import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Stack,
  Button,
  Flex,
  Avatar,
  Badge,
  useColorModeValue,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useDisclosure,
  useToast,
  Link,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";

const MIN_SKILLS = 3;

const EditSkillsModal = ({ isOpen, onClose, skills, onSave, loading }) => {
  const [localSkills, setLocalSkills] = useState(skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalSkills(skills || []);
    setNewSkill("");
    setError("");
  }, [skills, isOpen]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (localSkills.includes(trimmed)) {
      setError("Skill already added.");
      return;
    }
    setLocalSkills([...localSkills, trimmed]);
    setNewSkill("");
    setError("");
  };

  const handleRemoveSkill = (idx) => {
    setLocalSkills(localSkills.filter((_, i) => i !== idx));
    setError("");
  };

  const handleSave = () => {
    if (localSkills.length < MIN_SKILLS) {
      setError(`Please add at least ${MIN_SKILLS} skills.`);
      return;
    }
    onSave(localSkills);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Skills</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!error}>
            <FormLabel>Skills (min {MIN_SKILLS})</FormLabel>
            <Stack direction="row" mb={2} spacing={2}>
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <IconButton
                icon={<AddIcon />}
                colorScheme="blue"
                onClick={handleAddSkill}
                aria-label="Add skill"
                isDisabled={!newSkill.trim()}
              />
            </Stack>
            <Stack direction="row" wrap="wrap" spacing={2}>
              {localSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  colorScheme="green"
                  fontSize="0.95em"
                  px={2}
                  py={1}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  {skill}
                  <IconButton
                    icon={<DeleteIcon />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    ml={1}
                    aria-label="Remove skill"
                    onClick={() => handleRemoveSkill(idx)}
                    isDisabled={localSkills.length <= MIN_SKILLS}
                  />
                </Badge>
              ))}
            </Stack>
            {error && <FormErrorMessage mt={2}>{error}</FormErrorMessage>}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={loading}
            isDisabled={localSkills.length < MIN_SKILLS}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [skillsToEdit, setSkillsToEdit] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("blue.700", "blue.300");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const sectionBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: user.uid });
        } else {
          setUserData(null);
        }
      } catch (error) {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate]);

  // Fetch jobs based on role
  useEffect(() => {
    const fetchJobs = async () => {
      if (!userData) return;

      if (userData.role === "Job Seeker") {
        // Fetch applied jobs
        if (!userData.applications || userData.applications.length === 0) {
          setAppliedJobs([]);
          return;
        }
        try {
          const jobsRef = collection(db, "jobs");
          const jobsQuery = query(jobsRef);
          const jobsSnapshot = await getDocs(jobsQuery);
          const jobs = jobsSnapshot.docs
            .filter((doc) => userData.applications.includes(doc.id))
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setAppliedJobs(jobs);
        } catch (error) {
          setAppliedJobs([]);
        }
      } else if (userData.role === "Employer") {
        // Fetch posted jobs
        try {
          const jobsRef = collection(db, "jobs");
          const jobsQuery = query(
            jobsRef,
            where("postedBy", "==", userData.uid)
          );
          const jobsSnapshot = await getDocs(jobsQuery);
          const jobs = jobsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPostedJobs(jobs);
        } catch (error) {
          setPostedJobs([]);
        }
      }
    };
    fetchJobs();
  }, [userData]);

  const handleEditSkills = () => {
    setSkillsToEdit(userData?.skills || []);
    onOpen();
  };

  const handleSaveSkills = async (newSkills) => {
    setSavingSkills(true);
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { skills: newSkills });
      setUserData((prev) => ({ ...prev, skills: newSkills }));
      toast({
        title: "Skills updated.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error updating skills.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingSkills(false);
    }
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    );
  }

  return (
    <Box
      px={{ base: 2, md: 8 }}
      py={{ base: 4, md: 8 }}
      maxW="700px"
      mx="auto"
      mt={8}
      mb={8}
    >
      {/* Profile Card */}
      <Box
        bg={cardBg}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="xl"
        borderColor={cardBorder}
        p={{ base: 4, md: 8 }}
        mb={8}
      >
        <Flex align="center" gap={4} flexDir={{ base: "column", sm: "row" }}>
          <Avatar
            size="xl"
            name={userData?.name || "User"}
            src={userData?.avatarUrl}
            bg="blue.400"
            color="white"
          />
          <Box flex="1" w="100%">
            <Heading as="h2" size="lg" color={headingColor} mb={1}>
              {userData?.name || "No Name"}
            </Heading>
            <Text color={labelColor} fontSize="md" mb={1}>
              {userData?.email}
            </Text>
            <Text color={labelColor} fontSize="sm" mb={2}>
              {userData?.location || "Location not specified"}
            </Text>
            {/* Job Seeker: Skills */}
            {userData?.role === "Job Seeker" && (
              <Flex align="center" wrap="wrap" gap={2} mb={2}>
                <Text fontWeight="semibold" mr={2}>
                  Skills:
                </Text>
                {userData?.skills && userData.skills.length > 0 ? (
                  userData.skills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      colorScheme="green"
                      fontSize="0.85em"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    colorScheme="gray"
                    fontSize="0.85em"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    No skills listed
                  </Badge>
                )}
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  ml={2}
                  aria-label="Edit skills"
                  onClick={handleEditSkills}
                  variant="ghost"
                  colorScheme="blue"
                />
              </Flex>
            )}
            {/* Employer: Organization Info */}
            {userData?.role === "Employer" && (
              <Box mt={2}>
                <Text fontWeight="semibold" color={labelColor}>
                  Organization:{" "}
                  <Text as="span" color={headingColor} fontWeight="bold">
                    {userData.organization || "N/A"}
                  </Text>
                </Text>
                <Text fontWeight="semibold" color={labelColor}>
                  Industry:{" "}
                  <Text as="span" color={headingColor} fontWeight="bold">
                    {userData.industry || "N/A"}
                  </Text>
                </Text>
                <Text fontWeight="semibold" color={labelColor}>
                  Website:{" "}
                  {userData.website ? (
                    <Link href={userData.website} color="blue.400" isExternal>
                      {userData.website}
                    </Link>
                  ) : (
                    <Text as="span" color={headingColor} fontWeight="bold">
                      N/A
                    </Text>
                  )}
                </Text>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Job Seeker: Applied Jobs */}
      {userData?.role === "Job Seeker" && (
        <Box
          bg={sectionBg}
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          boxShadow="md"
          borderWidth={1}
          borderColor={cardBorder}
        >
          <Heading as="h3" size="md" mb={4} color={headingColor}>
            Applied Jobs
          </Heading>
          <Divider mb={4} />
          {appliedJobs.length > 0 ? (
            <Stack spacing={4}>
              {appliedJobs.map((job) => (
                <Box
                  key={job.id}
                  bg={cardBg}
                  borderRadius="md"
                  boxShadow="sm"
                  borderWidth={1}
                  borderColor={cardBorder}
                  p={4}
                  _hover={{ boxShadow: "lg", borderColor: "blue.300" }}
                  transition="box-shadow 0.2s, border-color 0.2s"
                >
                  <Flex
                    justify="space-between"
                    align={{ base: "start", md: "center" }}
                    flexDir={{ base: "column", md: "row" }}
                    gap={2}
                  >
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" mb={1}>
                        {job.title}
                      </Text>
                      <Text color={labelColor} fontSize="sm">
                        {job.company} &mdash; {job.location}
                      </Text>
                    </Box>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      mt={{ base: 2, md: 0 }}
                      onClick={() => navigate(`/job-details/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Stack>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="120px"
            >
              <Text color={labelColor} mb={3} fontSize="md">
                Oops! You haven't applied to any jobs yet.
              </Text>
              <Button colorScheme="blue" onClick={() => navigate("/jobs")}>
                Browse Jobs
              </Button>
            </Flex>
          )}
        </Box>
      )}

      {/* Employer: Posted Jobs & Add Job Posting */}
      {userData?.role === "Employer" && (
        <Box
          bg={sectionBg}
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          boxShadow="md"
          borderWidth={1}
          borderColor={cardBorder}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h3" size="md" color={headingColor}>
              Posted Jobs
            </Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => navigate("/add-job")}
            >
              Add Job Posting
            </Button>
          </Flex>
          <Divider mb={4} />
          {postedJobs.length > 0 ? (
            <Stack spacing={4}>
              {postedJobs.map((job) => (
                <Box
                  key={job.id}
                  bg={cardBg}
                  borderRadius="md"
                  boxShadow="sm"
                  borderWidth={1}
                  borderColor={cardBorder}
                  p={4}
                  _hover={{ boxShadow: "lg", borderColor: "blue.300" }}
                  transition="box-shadow 0.2s, border-color 0.2s"
                >
                  <Flex
                    justify="space-between"
                    align={{ base: "start", md: "center" }}
                    flexDir={{ base: "column", md: "row" }}
                    gap={2}
                  >
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" mb={1}>
                        {job.title}
                      </Text>
                      <Text color={labelColor} fontSize="sm">
                        {job.company} &mdash; {job.location}
                      </Text>
                    </Box>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      mt={{ base: 2, md: 0 }}
                      onClick={() => navigate(`/job-details/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Stack>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="120px"
            >
              <Text color={labelColor} mb={3} fontSize="md">
                You haven't posted any jobs yet.
              </Text>
              <Button colorScheme="blue" onClick={() => navigate("/add-job")}>
                Add Your First Job
              </Button>
            </Flex>
          )}
        </Box>
      )}

      {/* Edit Skills Modal */}
      <EditSkillsModal
        isOpen={isOpen}
        onClose={onClose}
        skills={skillsToEdit}
        onSave={handleSaveSkills}
        loading={savingSkills}
      />
    </Box>
  );
};

export default Profile;
