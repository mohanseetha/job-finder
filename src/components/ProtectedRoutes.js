import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoutes = ({ isProtected }) => {
  const { currentUser } = useAuth();

  if (!isProtected && currentUser) {
    return <Navigate to="/profile" />;
  }
  if (isProtected && !currentUser) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
