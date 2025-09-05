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
import Profile from './views/admin/profile';
import DataTables from './views/admin/dataTables';
import RTL from './views/admin/rtl';

// Auth Imports
import SignInCentered from './views/auth/signIn';
import SignUpCentered from './views/auth/signUp/index';
import AddBranch from './views/admin/Branches/AddBranch';

// NEW CLINIC MANAGEMENT ROUTES
const routes = [
  // Dashboard Section
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />, // Using existing dashboard component
    children: [
      {
        name: 'Overview',
        layout: '/admin',
        path: '/dashboard/overview',
        component: <MainDashboard />,
      },
      {
        name: "Today's Appointments",
        layout: '/admin',
        path: '/dashboard/today-appointments',
        component: <MainDashboard />,
      },
      {
        name: "Today's Reminders",
        layout: '/admin',
        path: '/dashboard/today-reminders',
        component: <MainDashboard />,
      },
    ],
  },

  // Branches Section
  {
    name: 'Branches',
    layout: '/admin',
    path: '/branches',
    icon: <Icon as={MdBusiness} width="20px" height="20px" color="inherit" />,
    component: <DataTables />, // Using existing data tables component
    children: [
      {
        name: 'All Branches',
        layout: '/admin',
        path: '/branches/all',
        component: <DataTables />,
      },
      {
        name: 'Add Branch',
        layout: '/admin',
        path: '/branches/add',
        component: <AddBranch />,
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
    children: [
      {
        name: 'All Doctors',
        layout: '/admin',
        path: '/doctors/all',
        component: <DataTables />,
      },
      {
        name: 'Add Doctor',
        layout: '/admin',
        path: '/doctors/add',
        component: <DataTables />,
      },
      {
        name: 'Doctor Reports',
        layout: '/admin',
        path: '/doctors/reports',
        component: <DataTables />,
      },
    ],
  },

  // Admins Section
  {
    name: 'Admins',
    layout: '/admin',
    path: '/admins',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    children: [
      {
        name: 'All Admins',
        layout: '/admin',
        path: '/admins/all',
        component: <DataTables />,
      },
      {
        name: 'Add Admin',
        layout: '/admin',
        path: '/admins/add',
        component: <DataTables />,
      },
    ],
  },

  // Patients Section
  {
    name: 'Patients',
    layout: '/admin',
    path: '/patients',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    children: [
      {
        name: 'Patient Database',
        layout: '/admin',
        path: '/patients/database',
        component: <DataTables />,
      },
      {
        name: 'Search Patient',
        layout: '/admin',
        path: '/patients/search',
        component: <DataTables />,
      },
      {
        name: 'Add Patient',
        layout: '/admin',
        path: '/patients/add',
        component: <DataTables />,
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
    children: [
      {
        name: 'All Appointments',
        layout: '/admin',
        path: '/appointments/all',
        component: <DataTables />,
      },
      {
        name: 'Create Appointment',
        layout: '/admin',
        path: '/appointments/create',
        component: <DataTables />,
      },
      {
        name: 'Calendar View',
        layout: '/admin',
        path: '/appointments/calendar',
        component: <DataTables />,
      },
    ],
  },

  // Billing & Services Section
  {
    name: 'Billing & Services',
    layout: '/admin',
    path: '/billing',
    icon: <Icon as={MdPayment} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    children: [
      {
        name: 'Bills (Pending / Completed)',
        layout: '/admin',
        path: '/billing/bills',
        component: <DataTables />,
      },
      {
        name: 'Add Bill',
        layout: '/admin',
        path: '/billing/add-bill',
        component: <DataTables />,
      },
      {
        name: 'Services List',
        layout: '/admin',
        path: '/billing/services',
        component: <DataTables />,
      },
      {
        name: 'Add Service',
        layout: '/admin',
        path: '/billing/add-service',
        component: <DataTables />,
      },
    ],
  },

  // Referred Doctors Section
  {
    name: 'Referred Doctors',
    layout: '/admin',
    path: '/referred-doctors',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
    children: [
      {
        name: 'All Referred Doctors',
        layout: '/admin',
        path: '/referred-doctors/all',
        component: <DataTables />,
      },
      {
        name: 'Add Referred Doctor',
        layout: '/admin',
        path: '/referred-doctors/add',
        component: <DataTables />,
      },
      {
        name: 'Referral Reports',
        layout: '/admin',
        path: '/referred-doctors/reports',
        component: <DataTables />,
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
    children: [
      {
        name: 'Inventory List',
        layout: '/admin',
        path: '/inventory/list',
        component: <DataTables />,
      },
      {
        name: 'Add Inventory Item',
        layout: '/admin',
        path: '/inventory/add',
        component: <DataTables />,
      },
      {
        name: 'Low Stock Alerts',
        layout: '/admin',
        path: '/inventory/alerts',
        component: <DataTables />,
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
    children: [
      {
        name: 'Branch-wise Report',
        layout: '/admin',
        path: '/reports/branch-wise',
        component: <DataTables />,
      },
      {
        name: 'Doctor-wise Report',
        layout: '/admin',
        path: '/reports/doctor-wise',
        component: <DataTables />,
      },
      {
        name: 'Referral Report',
        layout: '/admin',
        path: '/reports/referral',
        component: <DataTables />,
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
    children: [
      {
        name: 'Appointment Reminders',
        layout: '/admin',
        path: '/reminders/appointments',
        component: <DataTables />,
      },
      {
        name: 'Follow-up Reminders',
        layout: '/admin',
        path: '/reminders/follow-up',
        component: <DataTables />,
      },
    ],
  },

  // Settings Section
  // {
  //   name: 'Settings',
  //   layout: '/admin',
  //   path: '/settings',
  //   icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
  //   component: <Profile />, // Using existing profile component
  //   children: [
  //     {
  //       name: 'Profile & Security',
  //       layout: '/admin',
  //       path: '/settings/profile',
  //       component: <Profile />,
  //     },
  //     {
  //       name: 'Notification Templates',
  //       layout: '/admin',
  //       path: '/settings/notifications',
  //       component: <Profile />,
  //     },
  //     {
  //       name: 'System Settings',
  //       layout: '/admin',
  //       path: '/settings/system',
  //       component: <Profile />,
  //     },
  //   ],
  // },

      // Auth Section
    {
      name: 'Sign In',
      layout: '/auth',
      path: '/sign-in',
      icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
      component: <SignInCentered />,
    },
    {
      name: 'Register',
      layout: '/auth',
      path: '/sign-up',
      icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
      component: <SignUpCentered />,
    },
];

/* 
ORIGINAL ROUTES (COMMENTED FOR REFERENCE)
const originalRoutes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'NFT Marketplace',
    layout: '/admin',
    path: '/nft-marketplace',
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: 'Data Tables',
    layout: '/admin',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/data-tables',
    component: <DataTables />,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
  {
    name: 'RTL Admin',
    layout: '/rtl',
    path: '/rtl-default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <RTL />,
  },
];
*/

export default routes;
