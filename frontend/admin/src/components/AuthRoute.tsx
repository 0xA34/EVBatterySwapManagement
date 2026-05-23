import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function AuthRoute() {
  const { isAuthenticated, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}