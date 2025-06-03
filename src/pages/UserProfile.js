import React, { useEffect, useState } from "react";
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
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { db, auth } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import EditSkillsModal from "../components/EditSkillsModal";

const UserProfile = ({ userData }) => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [skillsToEdit, setSkillsToEdit] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardTextColor = useColorModeValue("gray.700", "gray.200");
  const sectionHeadingColor = useColorModeValue("blue.600", "blue.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (
        !userData ||
        !userData.applications ||
        userData.applications.length === 0
      ) {
        setAppliedJobs([]);
        setApplications([]);
        setLoading(false);
        return;
      }
      try {
        const jobsRef = collection(db, "jobs");
        const jobsSnapshot = await getDocs(jobsRef);
        const jobs = jobsSnapshot.docs
          .filter((doc) => userData.applications.includes(doc.id))
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        const applicationsRef = collection(db, "applications");
        const applicationsSnapshot = await getDocs(applicationsRef);
        const userApplications = applicationsSnapshot.docs
          .filter((doc) => doc.data().userId === userData.uid)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setAppliedJobs(jobs);
        setApplications(userApplications);
      } catch (error) {
        setAppliedJobs([]);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, [userData]);

  const handleEditSkills = () => {
    setSkillsToEdit(userData?.skills || []);
    setIsOpen(true);
  };

  const handleSaveSkills = async (newSkills) => {
    setSavingSkills(true);
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { skills: newSkills });
      toast({
        title: "Skills updated.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setIsOpen(false);
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
        <Spinner size="xl" color={sectionHeadingColor} />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={10} px={2}>
      <Box
        bg={cardBgColor}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="xl"
        borderColor={borderColor}
        p={{ base: 4, md: 8 }}
        mb={8}
        maxW="800px"
        mx="auto"
        color={cardTextColor}
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
            <Heading as="h2" size="lg" color={sectionHeadingColor} mb={1}>
              {userData?.name || "No Name"}
            </Heading>
            <Text color={cardTextColor} fontSize="md" mb={1}>
              {userData?.email}
            </Text>
            <Text color={cardTextColor} fontSize="sm" mb={2}>
              {userData?.location || "Location not specified"}
            </Text>
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
          </Box>
        </Flex>
      </Box>

      <Box
        bg={cardBgColor}
        borderRadius="xl"
        p={{ base: 4, md: 6 }}
        boxShadow="md"
        borderWidth={1}
        borderColor={borderColor}
        color={cardTextColor}
        maxW="800px"
        mx="auto"
      >
        <Heading as="h3" size="md" mb={4} color={sectionHeadingColor}>
          Applied Jobs
        </Heading>
        <Divider mb={4} />
        {appliedJobs.length > 0 ? (
          <Stack spacing={4}>
            {appliedJobs.map((job) => {
              const application = applications.find(
                (app) => app.jobId === job.id
              );
              return (
                <Box
                  key={job.id}
                  bg={cardBgColor}
                  borderRadius="md"
                  boxShadow="sm"
                  borderWidth={1}
                  borderColor={borderColor}
                  p={4}
                  _hover={{ boxShadow: "lg", borderColor: sectionHeadingColor }}
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
                      <Text color={cardTextColor} fontSize="sm">
                        {job.company} &mdash; {job.location}
                      </Text>
                      <Text color={cardTextColor} fontSize="sm" mt={1}>
                        Status:{" "}
                        <Badge
                          colorScheme={
                            application?.status === "shortlisted"
                              ? "green"
                              : application?.status === "rejected"
                              ? "red"
                              : "gray"
                          }
                          fontSize="0.85em"
                        >
                          {application?.status
                            ? application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)
                            : "Pending"}
                        </Badge>
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
              );
            })}
          </Stack>
        ) : (
          <Flex direction="column" align="center" justify="center" minH="120px">
            <Text color={cardTextColor} mb={3} fontSize="md">
              Oops! You haven't applied to any jobs yet.
            </Text>
            <Button colorScheme="blue" onClick={() => navigate("/jobs")}>
              Browse Jobs
            </Button>
          </Flex>
        )}
      </Box>

      <EditSkillsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        skills={skillsToEdit}
        onSave={handleSaveSkills}
        loading={savingSkills}
      />
    </Box>
  );
};

export default UserProfile;
