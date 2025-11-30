import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, UserCircle, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { AuthUserRole } from '@/types/types';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<AuthUserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/adminherelogin') {
      setSelectedRole('admin');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const roles = [
    { value: 'admin' as AuthUserRole, label: 'Administrator', icon: Shield, color: 'text-primary' },
    { value: 'driver' as AuthUserRole, label: 'Driver', icon: User, color: 'text-blue-400' },
    { value: 'student' as AuthUserRole, label: 'Student', icon: UserCircle, color: 'text-purple-400' },
    { value: 'parent' as AuthUserRole, label: 'Parent', icon: Users, color: 'text-pink-400' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }

    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const success = await login({
        username,
        password,
        role: selectedRole
      });

      if (success) {
        toast.success('Login successful!');
        
        if (selectedRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (selectedRole === 'driver') {
          navigate('/driver/dashboard');
        } else if (selectedRole === 'student' || selectedRole === 'parent') {
          navigate('/tracking/live');
        }
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <div className="w-full max-width-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Bus className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">My School Ride</h1>
          <p className="text-muted-foreground">School Transportation Management System</p>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Select your role and sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label>Select Your Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`
                          p-4 rounded-lg border-2 transition-all duration-200
                          ${selectedRole === role.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${role.color}`} />
                        <p className="text-sm font-medium">{role.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedRole && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </>
              )}
            </form>

            {selectedRole === 'admin' && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground text-center">
                  Demo Admin: chandrasekharadmin / chandrasekharadmin1023@@
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 My School Ride
        </p>
      </div>
    </div>
  );
}
