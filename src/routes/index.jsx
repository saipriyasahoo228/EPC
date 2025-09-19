// import { lazy } from 'react';
// import { createBrowserRouter } from 'react-router-dom';

// // project import
// import MainRoutes from './MainRoutes';
// import AdminLayout from 'layouts/AdminLayout';

// // render - landing page
// const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));

// // ==============================|| ROUTING RENDER ||============================== //

// const router = createBrowserRouter(
//   [
//     {
//       path: '/',
//       element: <AdminLayout />,
//       children: [
//         {
//           index: true,
//           element: <DashboardSales />
//         }
//       ]
//     },
//     MainRoutes
//   ],
//   { basename: import.meta.env.VITE_APP_BASE_NAME }
// );

// export default router;



// import { lazy } from 'react';
// import { createBrowserRouter } from 'react-router-dom';

// // Project imports
// import MainRoutes from './MainRoutes';
// import AdminLayout from 'layouts/AdminLayout';
// import GuestLayout from 'layouts/GuestLayout';

// // Lazy-loaded components
// const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
// const Login = lazy(() => import('../views/auth/login'));
// const Register = lazy(() => import('../views/auth/register'));

// // ==============================|| ROUTING RENDER ||============================== //

// const router = createBrowserRouter(
//   [
//     // GuestLayout as the default layout and login as default page
//     {
//       path: '/react/free',
//       element: <GuestLayout />,  // This ensures that GuestLayout is shown
//       children: [
//         {
//           index: true, // This makes the login page the default route
//           element: <Login /> // Login page will be shown as the default
//         },
//         {
//           path: 'login', // Relative path, not absolute
//           element: <Login /> // Login page route
//         },
//         {
//           path: 'register', // Relative path, not absolute
//           element: <Register /> // Register page route
//         }
//       ]
//     },

//     // Admin layout routes after login
//     {
//       path: '/react/free/dashboard',
//       element: <AdminLayout />,
//       children: [
//         {
//           path: '/react/free/dashboard', // Admin dashboard route
//           element: <DashboardSales />
//         }
//       ]
//     },

//     // Include any additional routes from MainRoutes
//     MainRoutes
//   ],
//   { basename: import.meta.env.VITE_APP_BASE_NAME } // Ensures the correct base path
// );

// export default router;





import { lazy } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import React from 'react';

import MainRoutes from './MainRoutes';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import { usePermissions } from '../contexts/PermissionsContext';
import { isUserAuthenticated } from '../auth';

const AuthOnly = ({ children }) => {
  if (!isUserAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const SiteSupervisorBlocker = ({ children }) => {
  const { user, loading } = usePermissions();
  if (loading) return null;
  const role = (user?.role || '').toString().toLowerCase();
  const rawGroups = Array.isArray(user?.groups) ? user.groups : [];
  const groupNames = rawGroups
    .map(g => (typeof g === 'string' ? g : (g?.name || g?.title || g?.slug || '')))
    .filter(Boolean)
    .map(s => s.toString().toLowerCase());
  const hasOtherGroup = groupNames.some(n => n && n !== 'site supervisor');
  const onlySiteSupOrNone = groupNames.length === 0 || !hasOtherGroup;
  const shouldBlock = role === 'site supervisor' && onlySiteSupOrNone;
  if (shouldBlock) return <Navigate to="/site-exec-sup" replace />;
  return <>{children}</>;
};

// const DashboardSales = lazy(() => import('../views/dashboard/DashSales'));
const DashboardSales = lazy(() => import('../views/dashboard/EpcDashboard'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const router = createHashRouter([
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  },
  {
    // path: '/login',
    path: '/dashboard',
    element: (
      <SiteSupervisorBlocker>
        <AuthOnly>
          <AdminLayout />
        </AuthOnly>
      </SiteSupervisorBlocker>
    ),
    children: [
      { index: true, element: <DashboardSales /> }
    ]
  },
  MainRoutes
]);

export default router;
