import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthInitialized, user } = useAuth();

  const normalizeRole = (role?: string) => {
    if (!role) {
      return '';
    }

    return role.toUpperCase().replace(/^ROLE_/, '');
  };

  if (!isAuthInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const currentRole = normalizeRole(user?.role);
    const acceptedRoles = allowedRoles.map((role) => normalizeRole(role));

    if (!currentRole || !acceptedRoles.includes(currentRole)) {
      return <Navigate to="/login" replace state={{ error: 'Bạn không có quyền truy cập!' }} />;
    }
  }

  return <Outlet />;
}
