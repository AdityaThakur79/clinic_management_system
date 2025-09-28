import React, { useEffect } from 'react';
import { useLoadUserQuery } from '../features/api/authApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const AuthInitializer = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Only check authentication if we have auth state but no user data
  const shouldCheckAuth = isAuthenticated && !user;
  
  const { data, error, isLoading } = useLoadUserQuery(undefined, {
    skip: !shouldCheckAuth, // Only check when needed
  });

  useEffect(() => {
    if (error && error.status === 401) {
      // Clear auth state if authentication fails
      localStorage.removeItem('auth');
      // Don't reload, let the app handle the redirect naturally
    }
  }, [error]);

  // Show loading while checking authentication (only briefly)
  if (shouldCheckAuth && isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
