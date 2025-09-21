import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../utils/helpers';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // While auth state is loading, don’t render anything
  if (loading) return null;

  if (!isAuthenticated) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin(user)) {
    // Logged in but not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
