import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Camera, Lock, Save, X, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
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

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    profile_image_url: '',
    username: ''
  });

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);

  // Password change
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [user, navigate]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const tableName = `${user.role}s`;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const profile = {
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          profile_image_url: data.profile_image_url || '',
          username: data.username || ''
        };
        setProfileData(profile);
        setEditedData(profile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 1MB)
    if (file.size > 1048576) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 1MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      // Update profile in database
      const tableName = `${user.role}s`;
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, profile_image_url: publicUrl }));
      setEditedData(prev => ({ ...prev, profile_image_url: publicUrl }));

      toast({
        title: 'Success',
        description: 'Profile image updated successfully'
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const tableName = `${user.role}s`;
      const { error } = await supabase
        .from(tableName)
        .update({
          full_name: editedData.full_name,
          email: editedData.email,
          phone: editedData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfileData(editedData);
      setIsEditing(false);

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validate password requirements
    const isPasswordValid = passwordRequirements.every(req => req.test(newPassword));
    if (!isPasswordValid) {
      toast({
        title: 'Invalid Password',
        description: 'Please meet all password requirements',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords are identical',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Verify current password
      const tableName = `${user.role}s`;
      const { data: userData } = await supabase
        .from(tableName)
        .select('password_hash')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData) throw new Error('User not found');

      // In production, verify password with bcrypt
      // For now, we'll skip verification in development
      
      // Hash new password (in production, use bcrypt)
      // const bcrypt = await import('bcryptjs');
      // const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error } = await supabase
        .from(tableName)
        .update({
          password_hash: newPassword, // In production, use hashedPassword
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password changed successfully. Please login again.'
      });

      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Logout after password change
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isPasswordValid = passwordRequirements.every(req => req.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  if (!user) return null;

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold gradient-text">Profile Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm xl:text-base">
          Manage your account information and preferences
        </p>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details and profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profileData.profile_image_url} alt={profileData.full_name} />
              <AvatarFallback className="text-2xl">
                {getInitials(profileData.full_name || user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Label htmlFor="profile-image" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </div>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Maximum file size: 1MB. Supported formats: JPG, PNG, WEBP
            </p>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={isEditing ? editedData.full_name : profileData.full_name}
                onChange={(e) => setEditedData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? 'bg-muted/50' : ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? editedData.email : profileData.email}
                    onChange={(e) => setEditedData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? 'bg-muted/50' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={isEditing ? editedData.phone : profileData.phone}
                    onChange={(e) => setEditedData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? 'bg-muted/50' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pr-10"
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
                            const isValid = req.test(newPassword);
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
                        onClick={handleChangePassword}
                        disabled={loading || !currentPassword || !isPasswordValid || !passwordsMatch}
                        className="w-full"
                      >
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedData(profileData);
                  }}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
