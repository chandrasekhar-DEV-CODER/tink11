import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const identifier = method === 'email' ? email : phone;
      
      if (!identifier) {
        toast({
          title: 'Error',
          description: `Please enter your ${method}`,
          variant: 'destructive'
        });
        return;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calculate expiration time (5 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Store OTP in database
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_email: method === 'email' ? email : '',
          user_phone: method === 'phone' ? phone : '',
          user_type: 'admin', // Default, will be updated based on user lookup
          otp_code: otp,
          expires_at: expiresAt.toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      // In production, send OTP via email/SMS service
      // For now, show it in console (development only)
      console.log('OTP Code:', otp);

      toast({
        title: 'OTP Sent',
        description: `A verification code has been sent to your ${method}. Please check and enter the code.`,
      });

      // Navigate to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          identifier,
          method,
          email: method === 'email' ? email : '',
          phone: method === 'phone' ? phone : ''
        } 
      });

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code. Please try again.',
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
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/login')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-2xl gradient-text">Forgot Password</CardTitle>
            </div>
            <CardDescription>
              Enter your email or phone number to receive a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={method} onValueChange={(v) => setMethod(v as 'email' | 'phone')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <TabsContent value="email" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={method === 'email'}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={method === 'phone'}
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                </TabsContent>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>The verification code will expire in 5 minutes</p>
        </div>
      </div>
    </div>
  );
}
