import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme'; 
import { useState } from 'react';
import { publicRoutes, adminRoutes } from './config/routes';


export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  
  return (
    <Provider store={store}>
      <ChakraProvider theme={currentTheme}>
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
