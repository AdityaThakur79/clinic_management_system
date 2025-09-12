// Chakra imports
import { Portal, Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import Footer from '../../components/footer/FooterAdmin.js';
// Layout components
import Navbar from '../../components/navbar/NavbarAdmin.js';
import Sidebar from '../../components/sidebar/Sidebar.js';
import { SidebarContext } from '../../contexts/SidebarContext';
import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { useLoadUserQuery } from '../../features/api/authApi';
import { useRBAC } from '../../hooks/useRBAC';
import routes from '../../routes.js';
import { adminRoutes } from '../../config/routes';

// Custom Chakra theme
export default function Dashboard(props) {
  const { ...rest } = props;
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Authentication state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  
  // Load user data on component mount
  const { data: userData, isLoading: userLoading } = useLoadUserQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated
  });
  
  // RBAC hook for filtered routes
  const { filteredRoutes, isLoading: rbacLoading } = useRBAC();
  
  // states and functions
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  
  // Move useDisclosure before any early returns
  const { onOpen } = useDisclosure();
  
  // Check authentication on mount
  useEffect(() => {
    // Authentication check is handled by the redirect below
  }, [isAuthenticated, userLoading]);
  
  // Show loading spinner while checking authentication or RBAC
  if (userLoading || rbacLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  // Redirect to sign-in if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  // functions for changing the states from components
  const getRoute = () => {
    return location.pathname !== '/admin/full-screen-maps';
  };
  const getActiveRoute = (routesToCheck) => {
    let activeRoute = 'Clinic Management System';
    const currentPath = location.pathname;
    
    for (let i = 0; i < routesToCheck.length; i++) {
      if (routesToCheck[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routesToCheck[i].items);
        if (collapseActiveRoute !== 'Clinic Management System') {
          return collapseActiveRoute;
        }
      } else if (routesToCheck[i].category) {
        let categoryActiveRoute = getActiveRoute(routesToCheck[i].items);
        if (categoryActiveRoute !== 'Clinic Management System') {
          return categoryActiveRoute;
        }
      } else {
        // Check main route
        if (currentPath === routesToCheck[i].layout + routesToCheck[i].path) {
          return routesToCheck[i].name;
        }
        
        // Check children routes
        if (routesToCheck[i].children) {
          for (let j = 0; j < routesToCheck[i].children.length; j++) {
            if (currentPath === routesToCheck[i].children[j].layout + routesToCheck[i].children[j].path) {
              return routesToCheck[i].children[j].name;
            }
          }
        }
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routesToCheck) => {
    let activeNavbar = false;
    const currentPath = location.pathname;
    for (let i = 0; i < routesToCheck.length; i++) {
      if (routesToCheck[i].collapse) {
        let collapseActiveNavbar = getActiveNavbar(routesToCheck[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routesToCheck[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routesToCheck[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        // Check main route
        if (currentPath === routesToCheck[i].layout + routesToCheck[i].path) {
          return routesToCheck[i].secondary;
        }
        
        // Check children routes
        if (routesToCheck[i].children) {
          for (let j = 0; j < routesToCheck[i].children.length; j++) {
            if (currentPath === routesToCheck[i].children[j].layout + routesToCheck[i].children[j].path) {
              return routesToCheck[i].children[j].secondary;
            }
          }
        }
      }
    }
    return activeNavbar;
  };
  const getActiveNavbarText = (routesToCheck) => {
    let activeNavbar = false;
    const currentPath = location.pathname;
    for (let i = 0; i < routesToCheck.length; i++) {
      if (routesToCheck[i].collapse) {
        let collapseActiveNavbar = getActiveNavbarText(routesToCheck[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routesToCheck[i].category) {
        let categoryActiveNavbar = getActiveNavbarText(routesToCheck[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        // Check main route
        if (currentPath === routesToCheck[i].layout + routesToCheck[i].path) {
          return routesToCheck[i].messageNavbar;
        }
        
        // Check children routes
        if (routesToCheck[i].children) {
          for (let j = 0; j < routesToCheck[i].children.length; j++) {
            if (currentPath === routesToCheck[i].children[j].layout + routesToCheck[i].children[j].path) {
              return routesToCheck[i].children[j].messageNavbar;
            }
          }
        }
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routesToCheck) => {
    return routesToCheck.map((route, key) => {
      if (route.layout === '/admin') {
        // Handle main route
        const mainRoute = (
          <Route path={`${route.path}`} element={route.component} key={key} />
        );
        
        // Handle children routes if they exist
        const childrenRoutes = route.children ? route.children.map((child, childKey) => (
          <Route 
            path={`${child.path}`} 
            element={child.component} 
            key={`${key}-${childKey}`} 
          />
        )) : null;
        
        return [mainRoute, ...(childrenRoutes || [])];
      }
      if (route.collapse) {
        return getRoutes(route.items);
      } else {
        return null;
      }
    }).flat().filter(Boolean);
  };
  document.documentElement.dir = 'ltr';
  return (
    <Box>
      <Box>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          <Sidebar routes={filteredRoutes} display="none" {...rest} />
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box>
                <Navbar
                  onOpen={onOpen}
                  logoText={'Aartiket Hearing and Speech Care'}
                  brandText={getActiveRoute(filteredRoutes)}
                  secondary={getActiveNavbar(filteredRoutes)}
                  message={getActiveNavbarText(filteredRoutes)}
                  fixed={fixed}
                  routes={filteredRoutes}
                  {...rest}
                />
              </Box>
            </Portal>

            {getRoute() ? (
              <Box
                mx="auto"
                p={{ base: '20px', md: '30px' }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                <Routes>
                  {/* Filtered routes based on user role */}
                  {getRoutes(filteredRoutes)}
                  
                  {/* New centralized admin routes */}
                  {adminRoutes.map((route) => (
                    <Route 
                      key={route.path} 
                      path={route.path.replace('/admin', '')} 
                      element={route.element} 
                    />
                  ))}
                  
                  <Route
                    path="/"
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                </Routes>
              </Box>
            ) : null}
            <Box>
              <Footer />
            </Box>
          </Box>
        </SidebarContext.Provider>
      </Box>
    </Box>
  );
}
