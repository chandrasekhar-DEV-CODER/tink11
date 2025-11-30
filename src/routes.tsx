import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import Vehicles from './pages/Vehicles';
import Routes from './pages/Routes';
import Stops from './pages/Stops';
import Students from './pages/Students';
import Trips from './pages/Trips';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageVehicles from './pages/admin/ManageVehicles';
import DriverDashboard from './pages/driver/DriverDashboard';
import LiveTrackingPage from './pages/tracking/LiveTracking';
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
    element: <Routes />
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
  }
];

export default routes;
