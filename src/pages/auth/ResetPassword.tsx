import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) }
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { email, verified } = location.state || {};

  if (!email || !verified) {
    navigate('/forgot-password');
    return null;
  }

  const isPasswordValid = passwordRequirements.every(req => req.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isPasswordValid) {
        toast({
          title: 'Invalid Password',
          description: 'Please meet all password requirements',
          variant: 'destructive'
        });
        return;
      }

      if (!passwordsMatch) {
        toast({
          title: 'Passwords Do Not Match',
          description: 'Please ensure both passwords are identical',
          variant: 'destructive'
        });
        return;
      }

      // Hash the password (in production, this should be done server-side)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password in the appropriate user table
      // First, find which table the user belongs to
      const tables = ['admins', 'drivers', 'parents', 'students'];
      let updated = false;

      for (const table of tables) {
        const { data: users } = await supabase
          .from(table)
          .select('id, email')
          .eq('email', email)
          .maybeSingle();

        if (users) {
          const { error } = await supabase
            .from(table)
            .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
            .eq('email', email);

          if (error) throw error;

          updated = true;
          break;
        }
      }

      if (!updated) {
        throw new Error('User not found');
      }

      // Mark reset token as used
      await supabase.rpc('mark_reset_token_used', { p_email: email });

      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated. You can now login with your new password.',
      });

      // Navigate to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <Card className="card-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl gradient-text flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Reset Password
            </CardTitle>
            <CardDescription>
              Create a new strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">Password Requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(password);
                    return (
                      <li key={index} className="flex items-center gap-2 text-xs">
                        {isValid ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className={isValid ? 'text-green-500' : 'text-muted-foreground'}>
                          {req.label}
                        </span>
                      </li>
                    );
                  })}
                  {confirmPassword && (
                    <li className="flex items-center gap-2 text-xs">
                      {passwordsMatch ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={passwordsMatch ? 'text-green-500' : 'text-muted-foreground'}>
                        Passwords match
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isPasswordValid || !passwordsMatch}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Resetting password for: {email}</p>
        </div>
      </div>
    </div>
  );
}
