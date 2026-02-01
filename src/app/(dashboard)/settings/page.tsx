'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { 
  employeeApi, 
  notificationApi, 
  authApi,
  EmployeeWithDetails, 
  NotificationPreference,
  getUploadUrl,
  ApiError
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Mail, Bell, MessageSquare, Calendar, Clock, FileText, Shield, CreditCard, KeyRound, CheckCircle } from "lucide-react";

// Notification type labels and icons
const notificationTypeConfig: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  leave_request: { 
    label: 'Leave Requests', 
    description: 'Notifications about leave request submissions and approvals',
    icon: <Calendar className="h-5 w-5" />
  },
  attendance: { 
    label: 'Attendance', 
    description: 'Clock-in/clock-out reminders and attendance updates',
    icon: <Clock className="h-5 w-5" />
  },
  payroll: { 
    label: 'Payroll', 
    description: 'Salary updates and payroll notifications',
    icon: <CreditCard className="h-5 w-5" />
  },
  announcement: { 
    label: 'Announcements', 
    description: 'Company-wide announcements and news',
    icon: <MessageSquare className="h-5 w-5" />
  },
  document: { 
    label: 'Documents', 
    description: 'Document uploads and approvals',
    icon: <FileText className="h-5 w-5" />
  },
  system: { 
    label: 'System', 
    description: 'System updates and security notifications',
    icon: <Shield className="h-5 w-5" />
  },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [employee, setEmployee] = useState<EmployeeWithDetails | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Account state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Notification state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [updatingPreference, setUpdatingPreference] = useState<string | null>(null);

  // Fetch employee profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.employee_id) {
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        const response = await employeeApi.get(user.employee_id);
        if (response.success && response.data) {
          setEmployee(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user?.employee_id, toast]);

  // Fetch notification preferences
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      try {
        const response = await notificationApi.getPreferences();
        if (response.success && response.data) {
          setNotificationPreferences(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotificationPreferences();
  }, []);

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.employee_id) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG or PNG image',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await employeeApi.uploadAvatar(user.employee_id, file);
      if (response.success && response.data) {
        setEmployee(prev => prev ? { ...prev, avatar_url: response.data!.avatar_url } : null);
        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated successfully',
        });
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New password and confirmation do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Note: Backend uses reset-password with token, 
      // For now we'll show a message to use forgot password flow
      // In production, you'd need a /auth/change-password endpoint
      toast({
        title: 'Feature coming soon',
        description: 'Password change via settings will be available soon. Please use the "Send Reset Link" button below.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Error',
          description: error.errorDetail.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to change password',
          variant: 'destructive',
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle send reset password email
  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'Unable to find your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingResetEmail(true);
    try {
      await authApi.forgotPassword({ email: user.email });
      setResetEmailSent(true);
      toast({
        title: 'Reset link sent!',
        description: 'Please check your email for the password reset link.',
      });
    } catch (error) {
      // Always show success for security (prevent email enumeration)
      setResetEmailSent(true);
      toast({
        title: 'Reset link sent!',
        description: 'If your email is registered, you will receive a password reset link.',
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Handle notification preference update
  const handleNotificationToggle = async (
    notificationType: string, 
    field: 'email_enabled' | 'push_enabled', 
    value: boolean
  ) => {
    setUpdatingPreference(`${notificationType}-${field}`);
    
    const existingPref = notificationPreferences.find(p => p.notification_type === notificationType);
    const updatedPref: NotificationPreference = {
      notification_type: notificationType as NotificationPreference['notification_type'],
      email_enabled: field === 'email_enabled' ? value : (existingPref?.email_enabled ?? true),
      push_enabled: field === 'push_enabled' ? value : (existingPref?.push_enabled ?? true),
    };

    try {
      const response = await notificationApi.updatePreference(updatedPref);
      if (response.success) {
        setNotificationPreferences(prev => {
          const index = prev.findIndex(p => p.notification_type === notificationType);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = updatedPref;
            return updated;
          }
          return [...prev, updatedPref];
        });
        toast({
          title: 'Preferences updated',
          description: 'Your notification preferences have been saved',
        });
      }
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    } finally {
      setUpdatingPreference(null);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      {/* Tab Profile */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              View your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={employee?.avatar_url ? getUploadUrl(employee.avatar_url) : undefined} />
                      <AvatarFallback className="text-lg">{getInitials(employee?.full_name)}</AvatarFallback>
                    </Avatar>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar || !user?.employee_id}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 5MB</p>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={employee?.full_name || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Employee Code</Label>
                    <Input value={employee?.employee_code || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={employee?.phone_number || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input value={employee?.position_name || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input value={employee?.branch_name || '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '-'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Hire Date</Label>
                    <Input 
                      value={employee?.hire_date 
                        ? new Date(employee.hire_date).toLocaleDateString('id-ID', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) 
                        : '-'
                      } 
                      disabled 
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  To update your profile information, please contact your HR administrator.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab Account */}
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reset Password via Email Section */}
            <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                  <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-medium">Reset Password via Email</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll send a secure reset link to your registered email address.
                    </p>
                    {user?.email && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Reset link will be sent to: <span className="font-medium">{user.email}</span>
                      </p>
                    )}
                  </div>
                  
                  {resetEmailSent ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Reset link sent! Check your email inbox.</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleSendResetEmail}
                      disabled={isSendingResetEmail}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSendingResetEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or change password directly</span>
              </div>
            </div>

            {/* Direct Password Change Form */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input 
                  id="current_password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input 
                  id="new_password" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input 
                  id="confirm_password" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                variant="outline"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Note: Direct password change feature is coming soon. Please use the email reset link above.
              </p>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab Notifications */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingNotifications ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(notificationTypeConfig).map(([type, config]) => {
                  const pref = notificationPreferences.find(p => p.notification_type === type);
                  const emailEnabled = pref?.email_enabled ?? true;
                  const pushEnabled = pref?.push_enabled ?? true;
                  
                  return (
                    <div key={type} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-muted-foreground">
                          {config.icon}
                        </div>
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={emailEnabled}
                            onCheckedChange={(checked) => handleNotificationToggle(type, 'email_enabled', checked)}
                            disabled={updatingPreference === `${type}-email_enabled`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={pushEnabled}
                            onCheckedChange={(checked) => handleNotificationToggle(type, 'push_enabled', checked)}
                            disabled={updatingPreference === `${type}-push_enabled`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
