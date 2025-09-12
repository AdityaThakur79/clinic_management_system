import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdDashboard,
  MdToday,
  MdNotifications,
  MdBusiness,
  MdAdd,
  MdLocalHospital,
  MdAssignment,
  MdPeople,
  MdSearch,
  MdEvent,
  MdCalendarToday,
  MdPayment,
  MdReceipt,
  MdList,
  MdLocalPharmacy,
  MdWarning,
  MdAssessment,
  MdSettings,
  MdSecurity,
  MdEmail,
  MdBuild,
  MdChevronRight,
} from 'react-icons/md';

// Admin Imports (keeping original for reference)
import MainDashboard from './views/admin/default';
import NFTMarketplace from './views/admin/marketplace';
import DataTables from './views/admin/dataTables';
import RTL from './views/admin/rtl';

// Auth Imports
import SignInCentered from './views/auth/signIn';
import SignUpCentered from './views/auth/signUp/index';
import AddBranch from './views/admin/Branches/AddBranch';
import Branches from './views/admin/Branches/Branches';
import AllDoctors from './views/admin/Doctors/AllDoctors';
import AddDoctor from './views/admin/Doctors/AddDoctor';
import AllBranchAdmins from './views/admin/BranchAdmin/AllBranchAdmins';
import AddBranchAdmin from './views/admin/BranchAdmin/AddBranchAdmin';
import UpdateBranch from './views/admin/Branches/UpdateBranch';
import Profile from './views/admin/profile/Profile';
import Services from './views/admin/Services/Services';
import AddService from './views/admin/Services/AddService';
import UpdateService from './views/admin/Services/UpdateService';
import AllReferredDoctors from './views/admin/ReferredDoctors/AllReferredDoctors';
import AddReferredDoctor from './views/admin/ReferredDoctors/AddReferredDoctor';
import UpdateReferredDoctor from './views/admin/ReferredDoctors/UpdateReferredDoctor';
import AllAppointments from './views/admin/Appointments/AllAppointments';
import TodayAppointments from './views/admin/Appointments/TodayAppointments';
import AddAppointment from './views/admin/Appointments/AddAppointment';
import CalendarView from './views/admin/Appointments/CalendarView';
import AllPatients from './views/admin/Patients/AllPatients';
import AddPatient from './views/admin/Patients/AddPatient';
import UpdatePatient from './views/admin/Patients/UpdatePatient';

// NEW CLINIC MANAGEMENT ROUTES
const routes = [
  // Dashboard Section
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />, // Using existing dashboard component
    roles: ['superAdmin', 'branchAdmin', 'doctor'],
    children: [
      {
        name: 'Overview',
        layout: '/admin',
        path: '/dashboard/overview',
        component: <MainDashboard />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: "Today's Appointments",
        layout: '/admin',
        path: '/dashboard/today-appointments',
        component: <TodayAppointments />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: "Today's Reminders",
        layout: '/admin',
        path: '/dashboard/today-reminders',
        component: <MainDashboard />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
    ],
  },

  // Branches Section (Only for Super Admin)
  {
    name: 'Branches',
    layout: '/admin',
    path: '/branches',
    icon: <Icon as={MdBusiness} width="20px" height="20px" color="inherit" />,
    component: <DataTables />, 
    roles: ['superAdmin'],
    children: [
      {
        name: 'All Branches',
        layout: '/admin',
        path: '/branches/all',
        component: <Branches />,
        roles: ['superAdmin'],
      },
      {
        name: 'Add Branch',
        layout: '/admin',
        path: '/branches/add',
        component: <AddBranch />,
        roles: ['superAdmin'],
      },
    ],
  },

    // Admins Section (Only for Super Admin)
    {
      name: 'Admins',
      layout: '/admin',
      path: '/admins',
      icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
      component: <DataTables />,
      roles: ['superAdmin'],
      children: [
        {
          name: 'All Admins',
          layout: '/admin',
          path: '/admins/all',
          component: <AllBranchAdmins />,
          roles: ['superAdmin'],
        },
        {
          name: 'Add Admin',
          layout: '/admin',
          path: '/admins/add',
          component: <AddBranchAdmin />,
          roles: ['superAdmin'],
        },
      ],
    },

  // Doctors Section
  {
    name: 'Doctors',
    layout: '/admin',
    path: '/doctors',
    icon: <Icon as={MdLocalHospital} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin', 'branchAdmin'],
    children: [
      {
        name: 'All Doctors',
        layout: '/admin',
        path: '/doctors/all',
        component: <AllDoctors />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      {
        name: 'Add Doctor',
        layout: '/admin',
        path: '/doctors/add',
        component: <AddDoctor />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      // {
      //   name: 'Doctor Reports',
      //   layout: '/admin',
      //   path: '/doctors/reports',
      //   component: <DataTables />,
      // },
    ],
  },


   // Services Section
   {
    name: 'Services',
    layout: '/admin',
    path: '/services',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin'],
    children: [
      {
        name: 'All Services',
        layout: '/admin',
        path: '/services/all',
        component: <Services />,
        roles: ['superAdmin'],
      },
      {
        name: 'Add Service',
        layout: '/admin',
        path: '/service/add',
        component: <AddService />,
        roles: ['superAdmin'],
      },
      {
        name: 'Update Service',
        layout: '/admin',
        path: '/service/update',
        component: <UpdateService />,
        roles: ['superAdmin'],
        hidden: true,
      },
      
    ],
  },
  // Patients Section
  {
    name: 'Patients',
    layout: '/admin',
    path: '/patients',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <AllPatients />,
    roles: ['superAdmin', 'branchAdmin', 'doctor'],
    children: [
      {
        name: 'Patients',
        layout: '/admin',
        path: '/patients/database',
        component: <AllPatients />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Add Patient',
        layout: '/admin',
        path: '/patients/add',
        component: <AddPatient />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Update Patient',
        layout: '/admin',
        path: '/patients/update',
        component: <UpdatePatient />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
        hidden: true,
      },
    ],
  },

  // Appointments Section
  {
    name: 'Appointments',
    layout: '/admin',
    path: '/appointments',
    icon: <Icon as={MdEvent} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin', 'branchAdmin', 'doctor'],
    children: [
      {
        name: 'All Appointments',
        layout: '/admin',
        path: '/appointments/all',
        component: <AllAppointments />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Create Appointment',
        layout: '/admin',
        path: '/appointments/create',
        component: <AddAppointment />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Calendar View',
        layout: '/admin',
        path: '/appointments/calendar',
        component: <CalendarView />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
    ],
  },

  // Billing & Services Section
  {
    name: 'Billing',
    layout: '/admin',
    path: '/billing',
    icon: <Icon as={MdPayment} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin', 'branchAdmin', 'doctor'],
    children: [
      {
        name: 'Bills (Pending / Completed)',
        layout: '/admin',
        path: '/billing/bills',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Add Bill',
        layout: '/admin',
        path: '/billing/add-bill',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Services List',
        layout: '/admin',
        path: '/billing/services',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Add Service',
        layout: '/admin',
        path: '/billing/add-service',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
    ],
  },

  // Referred Doctors Section
  {
    name: 'Referred Doctors',
    layout: '/admin',
    path: '/referred-doctors',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: <AllReferredDoctors />,
    roles: ['superAdmin', 'branchAdmin'],
    children: [
      {
        name: 'All Referred Doctors',
        layout: '/admin',
        path: '/referred-doctors/all',
        component: <AllReferredDoctors />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      {
        name: 'Add Referred Doctor',
        layout: '/admin',
        path: '/referred-doctors/add',
        component: <AddReferredDoctor />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      // {
      //   name: 'Referral Reports',
      //   layout: '/admin',
      //   path: '/referred-doctors/reports',
      //   component: <DataTables />,
      //   roles: ['superAdmin', 'branchAdmin'],
      // },
      {
        name: 'Update Referred Doctor',
        layout: '/admin',
        path: '/referred-doctors/update',
        component: <UpdateReferredDoctor />,
        roles: ['superAdmin', 'branchAdmin'],
        hidden: true,
      },
    ],
  },

  // Inventory Section
  {
    name: 'Inventory',
    layout: '/admin',
    path: '/inventory',
    icon: <Icon as={MdLocalPharmacy} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin', 'branchAdmin'],
    children: [
      {
        name: 'Inventory List',
        layout: '/admin',
        path: '/inventory/list',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      {
        name: 'Add Inventory Item',
        layout: '/admin',
        path: '/inventory/add',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      {
        name: 'Low Stock Alerts',
        layout: '/admin',
        path: '/inventory/alerts',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin'],
      },
    ],
  },

  // Reports Section
  {
    name: 'Reports',
    layout: '/admin',
    path: '/reports',
    icon: <Icon as={MdAssessment} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin', 'branchAdmin'],
    children: [
      {
        name: 'Branch-wise Report',
        layout: '/admin',
        path: '/reports/branch-wise',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      {
        name: 'Doctor-wise Report',
        layout: '/admin',
        path: '/reports/doctor-wise',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin'],
      },
      {
        name: 'Referral Report',
        layout: '/admin',
        path: '/reports/referral',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin'],
      },
    ],
  },

  // Reminders Section
  {
    name: 'Reminders',
    layout: '/admin',
    path: '/reminders',
    icon: <Icon as={MdNotifications} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    roles: ['superAdmin', 'branchAdmin', 'doctor'],
    children: [
      {
        name: 'Appointment Reminders',
        layout: '/admin',
        path: '/reminders/appointments',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
      {
        name: 'Follow-up Reminders',
        layout: '/admin',
        path: '/reminders/follow-up',
        component: <DataTables />,
        roles: ['superAdmin', 'branchAdmin', 'doctor'],
      },
    ],
  },


  // Profile Section
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
    roles: ['superAdmin', 'branchAdmin', 'doctor'],
   
  },
  
  // Auth Section (restore for sign-in/sign-up pages)
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
    hidden: true,
  },
  
];

// Function to get filtered routes based on user role
export const getRoutesByRole = (userRole) => {
  if (!userRole) return [];

  return routes.filter(route => {
    // Auth routes are always available
    if (route.layout === '/auth') return true;
    
    // Check if route has roles property
    if (route.roles) {
      return route.roles.includes(userRole);
    }
    
    // Default: allow all routes for superAdmin
    return userRole === 'superAdmin';
  }).map(route => {
    // Filter children routes as well
    if (route.children) {
      return {
        ...route,
        children: route.children.filter(child => {
          if (child.roles) {
            return child.roles.includes(userRole);
          }
          return userRole === 'superAdmin';
        })
      };
    }
    return route;
  });
};

export default routes;
