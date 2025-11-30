import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bus, 
  Route as RouteIcon, 
  Users, 
  MapPin, 
  History, 
  Settings,
  Map,
  UserCircle,
  Navigation,
  Shield,
  GraduationCap,
  UsersRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'driver', 'student', 'parent']
  },
  { 
    name: 'Live Tracking', 
    path: '/tracking/live', 
    icon: <Map className="w-5 h-5" />,
    roles: ['admin', 'driver', 'student', 'parent']
  },
  { 
    name: 'Admin Dashboard', 
    path: '/admin/dashboard', 
    icon: <Shield className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'User Management', 
    path: '/admin/students', 
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Driver Management', 
    path: '/admin/drivers', 
    icon: <UserCircle className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Parent Management', 
    path: '/admin/parents', 
    icon: <UsersRound className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Vehicle Management', 
    path: '/admin/vehicles', 
    icon: <Bus className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Driver Dashboard', 
    path: '/driver/dashboard', 
    icon: <Navigation className="w-5 h-5" />,
    roles: ['driver']
  },
  { 
    name: 'Vehicles', 
    path: '/vehicles', 
    icon: <Bus className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Routes', 
    path: '/routes', 
    icon: <RouteIcon className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Stops', 
    path: '/stops', 
    icon: <MapPin className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Students', 
    path: '/students', 
    icon: <Users className="w-5 h-5" />,
    roles: ['admin']
  },
  { 
    name: 'Trip History', 
    path: '/trips', 
    icon: <History className="w-5 h-5" />,
    roles: ['admin', 'driver']
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin', 'driver', 'student', 'parent']
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const getRoleBadge = () => {
    if (!user) return null;
    
    const roleColors = {
      admin: 'bg-primary text-primary-foreground',
      driver: 'bg-blue-500 text-white',
      student: 'bg-purple-500 text-white',
      parent: 'bg-orange-500 text-white'
    };

    const roleIcons = {
      admin: <Shield className="w-3 h-3" />,
      driver: <Navigation className="w-3 h-3" />,
      student: <GraduationCap className="w-3 h-3" />,
      parent: <UsersRound className="w-3 h-3" />
    };

    return (
      <div className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
        roleColors[user.role as keyof typeof roleColors]
      )}>
        {roleIcons[user.role as keyof typeof roleIcons]}
        <span className="capitalize">{user.role}</span>
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">My School Ride</h1>
            <p className="text-xs text-muted-foreground">Bus Tracking System</p>
          </div>
        </Link>
        {user && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.username}</p>
            </div>
            {getRoleBadge()}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                'hover:bg-secondary/50',
                isActive && 'bg-primary/10 text-primary border border-primary/20'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          © 2025 My School Ride
        </div>
      </div>
    </aside>
  );
}
