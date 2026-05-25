import { Navigate, Outlet } from 'react-router';

export default function RequireAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Kiểm tra token và role có phải ADMIN hay không
  if (!token || role !== "ADMIN") {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}
