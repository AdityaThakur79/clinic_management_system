import './assets/css/App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme'; 
import { useState, useEffect } from 'react';
import { publicRoutes, adminRoutes } from './config/routes';
import Lenis from 'lenis';


// Component to handle scroll to top on route changes
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    // Also scroll to top using Lenis if available
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, [location]);

  return null;
}

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  
  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Store lenis instance globally for use in other components
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);
  
  return (
    <Provider store={store}>
      <ChakraProvider theme={currentTheme}>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* Auth Routes */}
          <Route path="auth/*" element={<AuthLayout />} />
          
          {/* Admin Routes */}
          <Route
            path="admin/*"
            element={
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          
          {/* RTL Routes */}
          <Route
            path="rtl/*"
            element={
              <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          
          {/* Default redirect to sign-in */}
          <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </ChakraProvider>
    </Provider>
  );
}
