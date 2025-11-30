import { Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount] = useState(0);

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 xl:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="xl:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2 xl:gap-4 flex-1 xl:flex-initial min-w-0">
        <h2 className="text-sm xl:text-lg font-semibold truncate">Welcome back, {user?.full_name || 'User'}</h2>
        <Badge variant="outline" className="capitalize hidden sm:flex">
          {user?.role?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="flex items-center gap-2 xl:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-8 text-center text-muted-foreground">
                No notifications
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-8 hidden sm:block" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.full_name || null)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:inline">{user?.full_name || 'User'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
