import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // If the user isn't authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (the Outlet)
  return <Outlet />;
}
