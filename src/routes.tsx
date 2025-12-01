import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import Vehicles from './pages/Vehicles';
import RoutesPage from './pages/Routes';
import Stops from './pages/Stops';
import Students from './pages/Students';
import Trips from './pages/Trips';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageParents from './pages/admin/ManageParents';
import DriverDashboard from './pages/driver/DriverDashboard';
import LiveTrackingPage from './pages/tracking/LiveTracking';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import ProfileSettings from './pages/ProfileSettings';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />
  },
  {
    name: 'Admin Dashboard',
    path: '/admin/dashboard',
    element: <AdminDashboard />
  },
  {
    name: 'Manage Vehicles',
    path: '/admin/vehicles',
    element: <ManageVehicles />
  },
  {
    name: 'Manage Drivers',
    path: '/admin/drivers',
    element: <ManageDrivers />
  },
  {
    name: 'Manage Students',
    path: '/admin/students',
    element: <ManageStudents />
  },
  {
    name: 'Manage Parents',
    path: '/admin/parents',
    element: <ManageParents />
  },
  {
    name: 'Driver Dashboard',
    path: '/driver/dashboard',
    element: <DriverDashboard />
  },
  {
    name: 'Live Tracking',
    path: '/tracking/live',
    element: <LiveTrackingPage />
  },
  {
    name: 'Live Tracking (Legacy)',
    path: '/tracking',
    element: <LiveTracking />
  },
  {
    name: 'Vehicles',
    path: '/vehicles',
    element: <Vehicles />
  },
  {
    name: 'Routes',
    path: '/routes',
    element: <RoutesPage />
  },
  {
    name: 'Stops',
    path: '/stops',
    element: <Stops />
  },
  {
    name: 'Students',
    path: '/students',
    element: <Students />
  },
  {
    name: 'Trip History',
    path: '/trips',
    element: <Trips />
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <Settings />
  },
  {
    name: 'Profile Settings',
    path: '/profile',
    element: <ProfileSettings />
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPassword />,
    visible: false
  },
  {
    name: 'Verify OTP',
    path: '/verify-otp',
    element: <VerifyOTP />,
    visible: false
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPassword />,
    visible: false
  }
];

export default routes;
