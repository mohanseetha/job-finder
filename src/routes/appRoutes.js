import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import JobListings from "../pages/JobListing";
import Signup from "../pages/Signup";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import Profile from "../pages/Profile";
import JobDetails from "../pages/JobDetails";
import ProtectedRoutes from "../components/ProtectedRoutes";
import PostJob from "../pages/PostJob";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<JobListings />} />
      <Route path="/job-details/:jobId" element={<JobDetails />} />
      <Route path="/login" element={<ProtectedRoutes isProtected={false} />}>
        <Route index element={<Login />} />
      </Route>
      <Route path="/signup" element={<ProtectedRoutes isProtected={false} />}>
        <Route index element={<Signup />} />
      </Route>
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/about" element={<About />} /> 
      <Route path="*" element={<NotFound />} />
      <Route path="/profile" element={<ProtectedRoutes isProtected={true} />}>
        <Route index element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
