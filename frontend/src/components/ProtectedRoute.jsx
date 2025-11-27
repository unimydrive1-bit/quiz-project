import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Teacher trying to access student route or vice versa
    return user.role === "teacher" ? (
      <Navigate to="/teacher" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return children;
};

export default ProtectedRoute;
