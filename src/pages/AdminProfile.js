import { useEffect, useState } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  ViewIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  where,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AdminProfile = ({ userData }) => {
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardTextColor = useColorModeValue("gray.700", "gray.200");
  const sectionHeadingColor = useColorModeValue("blue.600", "blue.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchPostedJobs = async () => {
      setLoading(true);
      try {
        const jobsRef = collection(db, "jobs");
        const jobsQuery = query(jobsRef, where("postedBy", "==", userData.uid));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPostedJobs(jobs);
      } catch (error) {
        setPostedJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPostedJobs();
  }, [userData.uid]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?"))
      return;
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setPostedJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast({
        title: "Job deleted.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting job.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setApplicantsLoading(true);
    setIsApplicantsModalOpen(true);
    try {
      const applicationsRef = collection(db, "applications");
      const applicationsQuery = query(
        applicationsRef,
        where("jobId", "==", job.id)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = applicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplicants(applications);
    } catch (error) {
      setApplicants([]);
      toast({
        title: "Error loading applicants.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await updateDoc(doc(db, "applications", applicationId), { status });
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      toast({
        title: `Applicant ${
          status === "shortlisted" ? "shortlisted" : "rejected"
        }.`,
        status: status === "shortlisted" ? "success" : "warning",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating status.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10} px={2}>
      {/* Profile Card */}
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
            <Box mt={2}>
              <Text fontWeight="semibold" color={cardTextColor}>
                Organization:{" "}
                <Text as="span" color={sectionHeadingColor} fontWeight="bold">
                  {userData.organization || "N/A"}
                </Text>
              </Text>
              <Text fontWeight="semibold" color={cardTextColor}>
                Industry:{" "}
                <Text as="span" color={sectionHeadingColor} fontWeight="bold">
                  {userData.industry || "N/A"}
                </Text>
              </Text>
              <Text fontWeight="semibold" color={cardTextColor}>
                Website:{" "}
                {userData.website ? (
                  <a
                    href={userData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3182ce" }}
                  >
                    {userData.website}
                  </a>
                ) : (
                  <Text as="span" color={sectionHeadingColor} fontWeight="bold">
                    N/A
                  </Text>
                )}
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Posted Jobs Section */}
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
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h3" size="md" color={sectionHeadingColor}>
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
        {loading ? (
          <Flex align="center" justify="center" minH="120px">
            <Spinner size="lg" color={sectionHeadingColor} />
          </Flex>
        ) : postedJobs.length > 0 ? (
          <Stack spacing={4}>
            {postedJobs.map((job) => (
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
                  </Box>
                  <Flex gap={2} mt={{ base: 2, md: 0 }}>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => handleViewApplicants(job)}
                    >
                      View Applicants
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      leftIcon={<DeleteIcon />}
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      colorScheme="gray"
                      size="sm"
                      onClick={() => navigate(`/job-details/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Stack>
        ) : (
          <Flex direction="column" align="center" justify="center" minH="120px">
            <Text color={cardTextColor} mb={3} fontSize="md">
              You haven't posted any jobs yet.
            </Text>
            <Button colorScheme="blue" onClick={() => navigate("/add-job")}>
              Add Your First Job
            </Button>
          </Flex>
        )}
      </Box>

      {/* Applicants Modal */}
      <Modal
        isOpen={isApplicantsModalOpen}
        onClose={() => setIsApplicantsModalOpen(false)}
        size="xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          maxW={{ base: "98vw", md: "800px" }}
          w="100%"
          borderRadius="xl"
        >
          <ModalHeader>Applicants for: {selectedJob?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0} maxH={{ base: "60vh", md: "70vh" }} overflowY="auto">
            <Box w="100%" overflowX="auto" p={{ base: 2, md: 4 }}>
              {applicantsLoading ? (
                <Flex align="center" justify="center" minH="100px">
                  <Spinner size="lg" color={sectionHeadingColor} />
                </Flex>
              ) : applicants.length > 0 ? (
                <Table size="sm" variant="simple" minW="600px">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                      <Th>Resume</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {applicants.map((app) => (
                      <Tr key={app.id}>
                        <Td>{app.name || "Unknown"}</Td>
                        <Td>{app.email || "Unknown"}</Td>
                        <Td>{app.phone || "N/A"}</Td>
                        <Td>
                          {app.resumeLink ? (
                            <a
                              href={app.resumeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#3182ce",
                                textDecoration: "underline",
                              }}
                            >
                              View Resume
                            </a>
                          ) : (
                            <Text color="gray.400">No Resume</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              app.status === "shortlisted"
                                ? "green"
                                : app.status === "rejected"
                                ? "red"
                                : "gray"
                            }
                          >
                            {app.status
                              ? app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)
                              : "Pending"}
                          </Badge>
                        </Td>
                        <Td>
                          <Tooltip label="Shortlist">
                            <IconButton
                              icon={<CheckIcon />}
                              colorScheme="green"
                              size="sm"
                              mr={2}
                              aria-label="Shortlist"
                              onClick={() =>
                                handleUpdateStatus(app.id, "shortlisted")
                              }
                              isDisabled={app.status === "shortlisted"}
                            />
                          </Tooltip>
                          <Tooltip label="Reject">
                            <IconButton
                              icon={<CloseIcon />}
                              colorScheme="red"
                              size="sm"
                              aria-label="Reject"
                              onClick={() =>
                                handleUpdateStatus(app.id, "rejected")
                              }
                              isDisabled={app.status === "rejected"}
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color={cardTextColor} textAlign="center" p={4}>
                  No applicants yet for this job.
                </Text>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsApplicantsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminProfile;
