import React, { useEffect } from 'react';
import { useLoadUserQuery } from '../features/api/authApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const AuthInitializer = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Always check authentication status on app load
  const { data, error, isLoading } = useLoadUserQuery(undefined, {
    skip: false, // Always check authentication
  });

  useEffect(() => {
    if (error && error.status === 401) {
      // Clear auth state if authentication fails
      localStorage.removeItem('auth');
      // Don't reload, let the app handle the redirect naturally
    }
  }, [error]);

  // Show loading while checking authentication (only briefly)
  if (isLoading && !isAuthenticated) {
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
