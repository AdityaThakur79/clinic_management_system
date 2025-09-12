import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';
import { Box, Spinner, Center } from '@chakra-ui/react';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  console.log("ProtectedRoute isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute user:", user);

  // If not authenticated, redirect to sign-in
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check for required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Box p={8} textAlign="center">
        <Box fontSize="xl" color="red.500" mb={4}>
          Access Denied
        </Box>
        <Box color="gray.600">
          You don't have permission to access this page.
        </Box>
      </Box>
    );
  }

  // Check for required permission
  if (requiredPermission) {
    const permissions = {
      superAdmin: ['all'],
      branchAdmin: ['view_doctors', 'manage_doctors', 'view_patients', 'manage_patients', 'view_appointments', 'manage_appointments', 'view_billing', 'manage_billing', 'view_reports'],
      doctor: ['view_patients', 'manage_patients', 'view_appointments', 'manage_appointments', 'view_billing']
    };
    
    const userPermissions = permissions[user.role] || [];
    const hasPermission = userPermissions.includes('all') || userPermissions.includes(requiredPermission);
    
    if (!hasPermission) {
      return (
        <Box p={8} textAlign="center">
          <Box fontSize="xl" color="red.500" mb={4}>
            Access Denied
          </Box>
          <Box color="gray.600">
            You don't have the required permission to access this page.
          </Box>
        </Box>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
