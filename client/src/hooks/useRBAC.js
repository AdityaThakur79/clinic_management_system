import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';
import { getRoutesByRole } from '../routes';

export const useRBAC = () => {
  const [userRole, setUserRole] = useState(null);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get authentication state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    // If not authenticated, clear everything
    if (!isAuthenticated || !user) {
      setUserRole(null);
      setFilteredRoutes([]);
      setIsLoading(false);
      return;
    }

    // Get user role from Redux store
    const role = user?.role;
    setUserRole(role);
    
    if (role) {
      const routes = getRoutesByRole(role);
      setFilteredRoutes(routes);
    }
    
    setIsLoading(false);
  }, [isAuthenticated, user]);

  const checkAccess = (route) => {
    if (!userRole) return false;
    return filteredRoutes.some(r => r.path === route || r.children?.some(child => child.path === route));
  };

  const checkPermission = (permission) => {
    if (!userRole) return false;
    
    // Define permission mappings based on role
    const permissions = {
      superAdmin: ['all'],
      branchAdmin: ['view_doctors', 'manage_doctors', 'view_patients', 'manage_patients', 'view_appointments', 'manage_appointments', 'view_billing', 'manage_billing', 'view_reports'],
      doctor: ['view_patients', 'manage_patients', 'view_appointments', 'manage_appointments', 'view_billing']
    };
    
    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const isSuperAdmin = () => userRole === 'superAdmin';
  const isBranchAdmin = () => userRole === 'branchAdmin';
  const isDoctor = () => userRole === 'doctor';

  return {
    userRole,
    filteredRoutes,
    isLoading,
    checkAccess,
    checkPermission,
    isSuperAdmin,
    isBranchAdmin,
    isDoctor,
    ROLES: {
      SUPER_ADMIN: 'superAdmin',
      BRANCH_ADMIN: 'branchAdmin',
      DOCTOR: 'doctor'
    }
  };
};