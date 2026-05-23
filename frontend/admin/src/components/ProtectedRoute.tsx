// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthInitialized, user } = useAuth();

  const normalizeRole = (role?: string) => {
    if (!role) {
      return "";
    }
    return role.toLowerCase().replace(/^role_/, "");
  };

  // Tránh redirect sớm khi app chưa khôi phục phiên từ localStorage
  if (!isAuthInitialized) {
    return null;
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const currentRole = normalizeRole(user?.role);
  if (allowedRoles?.length) {
    const acceptedRoles = allowedRoles.map((role) => normalizeRole(role));

    if (!currentRole || !acceptedRoles.includes(currentRole)) {
      return <Navigate to="/signin" replace state={{ error: "Bạn không có quyền truy cập!" }} />;
    }
  }

  // Đủ điều kiện, cho phép render các component con (Dashboard, Layout...)
  return <Outlet />;
}