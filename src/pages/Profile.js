import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import UserProfile from "./UserProfile";
import AdminProfile from "./AdminProfile";
import { Spinner, Flex } from "@chakra-ui/react";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: user.uid });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    );
  }

  if (!userData) return null;

  if (userData.role === "Employer") {
    return <AdminProfile userData={userData} />;
  }
  return <UserProfile userData={userData} />;
};

export default Profile;
