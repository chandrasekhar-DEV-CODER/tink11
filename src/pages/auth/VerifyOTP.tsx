import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const { identifier, method, email, phone } = location.state || {};

  useEffect(() => {
    if (!identifier) {
      navigate('/forgot-password');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: 'Code Expired',
            description: 'Your verification code has expired. Please request a new one.',
            variant: 'destructive'
          });
          navigate('/forgot-password');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [identifier, navigate, toast]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const otpCode = otp.join('');

      if (otpCode.length !== 6) {
        toast({
          title: 'Invalid Code',
          description: 'Please enter the complete 6-digit verification code',
          variant: 'destructive'
        });
        return;
      }

      // Verify OTP using the database function
      const { data, error } = await supabase.rpc('verify_reset_otp', {
        p_email: email || identifier,
        p_otp: otpCode
      });

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect or has expired. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Verification Successful',
        description: 'Your code has been verified. You can now reset your password.',
      });

      // Navigate to reset password page
      navigate('/reset-password', {
        state: {
          email: email || identifier,
          phone,
          verified: true
        }
      });

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Store new OTP
      const { error } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_email: email || '',
          user_phone: phone || '',
          user_type: 'admin',
          otp_code: newOtp,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      console.log('New OTP Code:', newOtp);

      toast({
        title: 'Code Resent',
        description: 'A new verification code has been sent.',
      });

      setOtp(['', '', '', '', '', '']);
      setTimeLeft(300);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend code',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <Card className="card-elegant">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/forgot-password')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-2xl gradient-text">Verify Code</CardTitle>
            </div>
            <CardDescription>
              Enter the 6-digit code sent to {method === 'email' ? 'your email' : 'your phone'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-center block">Verification Code</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={loading}
                      className="w-12 h-12 text-center text-lg font-bold bg-background/50"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Code expires in: <span className="font-bold text-primary">{formatTime(timeLeft)}</span></span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.some(d => !d)}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={loading || timeLeft > 240}
                  className="text-primary hover:text-primary/80"
                >
                  Resend Code {timeLeft > 240 && `(${formatTime(300 - timeLeft)})`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Sent to: {identifier}</p>
        </div>
      </div>
    </div>
  );
}
