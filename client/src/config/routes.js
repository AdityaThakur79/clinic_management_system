// Centralized Route Configuration
// This file manages all routes for the application

// Import all components
import Home from '../views/User/Pages/Home';
import About from '../views/User/Pages/About';
import Services from '../views/User/Pages/Services';
import Contact from '../views/User/Pages/Contact';
import AddBranch from '../views/admin/Branches/AddBranch';
import EnquiriesAdmin from '../views/admin/Enquiries/EnquiriesAdmin';
import Branches from '../views/admin/Branches/Branches';
import UpdateBranch from '../views/admin/Branches/UpdateBranch';
import AddBranchAdmin from '../views/admin/BranchAdmin/AddBranchAdmin';
import AllBranchAdmins from '../views/admin/BranchAdmin/AllBranchAdmins';
import UpdateBranchAdmin from '../views/admin/BranchAdmin/UpdateBranchAdmin';
import AddDoctor from '../views/admin/Doctors/AddDoctor';
import ButtonShowcase from '../components/ButtonShowcase';
import AllDoctors from '../views/admin/Doctors/AllDoctors';
import UpdateDoctor from '../views/admin/Doctors/UpdateDoctor';
import DoctorDetailPage from '../views/User/Components/DoctorDetailPage';
import Doctors from '../views/User/Pages/Doctors';
import ServiceDetail from '../views/User/ServiceDetail';
import ForgotPassword from '../views/auth/forgotPassword/index';
import HearingAidBrands from '../views/User/Components/HearingAidBrands';
import HearingAidDevices from '../views/User/Components/HearingAidDevices';
import HearingAidBrand from '../views/User/HearingAidBrand';
import HearingAidDevice from '../views/User/HearingAidDevice';
import LocationSEO from '../views/User/Pages/LocationSEO';
import BookAppointment from '../views/User/Pages/BookAppointment';
import ServiceBookingPage from '../views/User/Pages/ServiceBookingPage';

// Public Routes (No authentication required)
export const publicRoutes = [
  {
    path: '/',
    element: <Home />,
    name: 'Home',
    showInNav: true,
  },
  {
    path: '/about',
    element: <About />,
    name: 'About',
    showInNav: true,
  },
  {
    path: '/services',
    element: <Services />,
    name: 'Services',
    showInNav: true,
  },
  {
    path: '/contact',
    element: <Contact />,
    name: 'Contact',
    showInNav: true,
  },
  {
    path: '/doctors',
    element: <Doctors />,
    name: 'Doctors',
    showInNav: true,
  },
  {
    path: '/book-an-appointment',
    element: <BookAppointment />,
    name: 'Doctors',
    showInNav: true,
  },

  {
    path: '/doctor/:id',
    element: <DoctorDetailPage />,
    name: 'Doctor Detail',
    showInNav: false,
  },
  {
    path: '/service/:slug',
    element: <ServiceDetail />,
    name: 'Service Detail',
    showInNav: false,
  },
  {
    path: '/book-service/:serviceSlug',
    element: <ServiceBookingPage />,
    name: 'Book Service',
    showInNav: false,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPassword />,
    name: 'Forgot Password',
    showInNav: false,
  },
  {
    path: '/hearing-aids/:brandSlug',
    element: <HearingAidBrand />,
    name: 'Hearing Aid Brand',
    showInNav: false,
  },
  {
    path: '/hearing-aids/:brandSlug/:deviceSlug',
    element: <HearingAidDevice />,
    name: 'Hearing Aid Device',
    showInNav: false,
  },
  {
    path: '/mumbai/:areaSlug',
    element: <LocationSEO />,
    name: 'Mumbai Locality SEO',
    showInNav: false,
  },
];

// Admin Routes (Authentication required)
export const adminRoutes = [
  //Branch
  {
    path: '/admin/branches',
    element: <Branches />,
    name: 'All Branches',
    showInSidebar: true,
    category: 'Branches',
  },
  {
    path: '/admin/branches/add',
    element: <AddBranch />,
    name: 'Add Branch',
    showInSidebar: true,
    category: 'Branches',
  },
  {
    path: '/admin/branches/update',
    element: <UpdateBranch />,
    name: 'Update Branch',
    showInSidebar: false, 
    category: 'Branches',
  },
  //Branch Admins
  {
    path: '/admin/branch-admins',
    element: <AllBranchAdmins />,
    name: 'All Branch Admins',
    showInSidebar: true,
    category: 'Branch Admins',
  },
  {
    path: '/admin/branch-admins/add',
    element: <AddBranchAdmin />,
    name: 'Add Branch Admin',
    showInSidebar: true,
    category: 'Branch Admins',
  },
  {
    path: '/admin/branch-admins/update',
    element: <UpdateBranchAdmin />,
    name: 'Update Branch Admin',
    showInSidebar: false, 
    category: 'Branch Admins',
  },
  //Doctors
  {
    path: '/admin/doctors',
    element: <AllDoctors />,
    name: 'All Doctors',
    showInSidebar: true,
    category: 'Doctors',
  },
  {
    path: '/admin/doctors/add',
    element: <AddDoctor />,
    name: 'Add Doctor',
    showInSidebar: true,
    category: 'Doctors',
  },
  {
    path: '/admin/doctors/update',
    element: <UpdateDoctor />,
    name: 'Update Doctor',
    showInSidebar: false, 
    category: 'Doctors',
  },
  {
    path: '/admin/button-showcase',
    element: <ButtonShowcase />,
    name: 'Button Showcase',
    showInSidebar: true,
    category: 'UI Components',
  },
  {
    path: '/admin/enquiries',
    element: <EnquiriesAdmin />,
    name: 'Enquiries',
    showInSidebar: true,
    category: 'Customer Care',
  },
  
];

// Utility function to get all routes
export const getAllRoutes = () => {
  return {
    public: publicRoutes,
    admin: adminRoutes,
  };
};

// Utility function to get routes by category
export const getRoutesByCategory = (category) => {
  return adminRoutes.filter(route => route.category === category);
};

// Utility function to get sidebar routes
export const getSidebarRoutes = () => {
  return adminRoutes.filter(route => route.showInSidebar === true);
};

// Utility function to get public navigation routes
export const getPublicNavRoutes = () => {
  return publicRoutes.filter(route => route.showInNav === true);
};
