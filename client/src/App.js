import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import {} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import Herosection from './views/User/Herosection';
// import AuthInitializer from './components/AuthInitializer';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/theme'; 
import { useState } from 'react';

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <Provider store={store}>
      <ChakraProvider theme={currentTheme}>
        <Routes>
          <Route path="/" element={<Herosection />} />
          <Route path="auth/*" element={<AuthLayout />} />
          <Route
            path="admin/*"
            element={
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          <Route
            path="rtl/*"
            element={
              <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
        </Routes>
      </ChakraProvider>
    </Provider>
  );
}
