"use client";

import { Metadata } from "next";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { User, Mail, Phone, MapPin, Calendar, Camera, Crown, Shield, Star } from "lucide-react";
import toast from "react-hot-toast";

// export const metadata: Metadata = {
//   title: "Profile Settings - PTracker",
//   description: "Manage your profile information and preferences",
// };

export default function ProfileSettingsPage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    timezone: '',
    language: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: (user as any).bio || '',
        timezone: (user as any).timezone || '',
        language: (user as any).language || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: (user as any).bio || '',
        timezone: (user as any).timezone || '',
        language: (user as any).language || '',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'moderator':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getAccountAge = () => {
    if (!user?.createdAt) return 0;
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading || !user) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your profile information and preferences
              </p>
            </div>
            {user.role === 'admin' && (
              <Badge className={`${getRoleColor(user.role)} flex items-center gap-2`}>
                {getRoleIcon(user.role)}
                <span className="capitalize">{user.role}</span>
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={(user as any).profilePicture || '/api/placeholder/128/128'} alt="Profile" />
                    <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email || ''}
                      disabled
                      className="flex-1 bg-muted cursor-not-allowed" 
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast('Email change requires verification. This feature is coming soon!', {
                        icon: 'ℹ️',
                        duration: 4000,
                      })}
                    >
                      Change Email
                    </Button>
                  </div>
                  {user.emailVerified ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Email verified
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Email not verified
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    To change your email address, you'll need to verify the new email address for security.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Role and Account Status */}
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-4">
                    <Badge className={`${getRoleColor(user.role)} flex items-center gap-2`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                    {user.twoFactorEnabled && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        2FA Enabled
                      </Badge>
                    )}
                    {(user as any).tier && (
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span className="capitalize">{(user as any).tier}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone" 
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    placeholder="America/New_York" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input 
                    id="language" 
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    placeholder="English (US)" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRoleColor(user.role)} flex items-center gap-2`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role} Account</span>
                    </Badge>
                    {user.role === 'admin' && (
                      <span className="text-sm text-muted-foreground">Full system access</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Login Method</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {user.authProvider ? `${user.authProvider.charAt(0).toUpperCase()}${user.authProvider.slice(1)}` : 'Email'}
                    </Badge>
                    {(user as any).walletAddress && (
                      <Badge variant="outline">Wallet Connected</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{getAccountAge()}</div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{(user as any).loginCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Logins</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{(user as any).knowledgeScore || 0}</div>
                  <div className="text-sm text-muted-foreground">Knowledge Score</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{(user as any).investmentScore || 0}</div>
                  <div className="text-sm text-muted-foreground">Investment Score</div>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Admin Access</h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You have administrator privileges with full system access. Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}