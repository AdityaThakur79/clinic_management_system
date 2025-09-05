import React, { useEffect } from 'react';
import { useLoadUserQuery } from '../features/api/authApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const AuthInitializer = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Only try to load user if we have auth state but no user data
  const shouldLoadUser = isAuthenticated && !user;
  
  const { data, error, isLoading } = useLoadUserQuery(undefined, {
    skip: !shouldLoadUser,
  });

  useEffect(() => {
    if (error) {
      // Only clear auth state if it's a 401 (unauthorized) error
      console.log('Failed to load user, error:', error);
      if (error.status === 401) {
        console.log('Unauthorized, clearing auth state');
        localStorage.removeItem('auth');
        window.location.reload();
      }
    }
  }, [error]);

  // Show loading while checking authentication
  if (shouldLoadUser && isLoading) {
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
