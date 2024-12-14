import React, { useEffect, useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import JobCard from "../components/JobCard";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const jobsCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobList);
    };

    fetchJobs();
  }, []);

  return (
    <Box p={6}>
      <Text fontSize="3xl" fontWeight="bold" mb={6} textAlign="center">
        Featured Job Listings
      </Text>
      <Flex
        wrap="wrap"
        justify="center"
        align="flex-start"
        gap={6}
      >
        {jobs.length > 0 ? (
          jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <Text>No jobs available</Text>
        )}
      </Flex>
    </Box>
  );
};

export default JobListings;
