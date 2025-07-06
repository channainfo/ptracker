'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Key,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'logout';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: 30
  });
  const [recentActivity, setRecentActivity] = useState<SecurityEvent[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    // Mock data - replace with actual API calls
    setRecentActivity([
      {
        id: '1',
        type: 'login',
        timestamp: '2025-01-01T10:30:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/120.0.0.0',
        location: 'New York, US'
      },
      {
        id: '2',
        type: '2fa_enabled',
        timestamp: '2025-01-01T09:15:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/120.0.0.0',
        location: 'New York, US'
      }
    ]);

    if (user) {
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: user.twoFactorEnabled
      }));
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await response.json();

      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setShow2FASetup(true);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ token: verificationCode })
      });

      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      setShow2FASetup(false);
      setVerificationCode('');
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const confirmed = confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Mock API call
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });

      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    const icons = {
      login: '🔑',
      password_change: '🔒',
      '2fa_enabled': '🛡️',
      '2fa_disabled': '⚠️',
      logout: '🚪'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getEventDescription = (event: SecurityEvent) => {
    const descriptions = {
      login: 'Successful login',
      password_change: 'Password changed',
      '2fa_enabled': 'Two-factor authentication enabled',
      '2fa_disabled': 'Two-factor authentication disabled',
      logout: 'Logged out'
    };
    return descriptions[event.type] || 'Security event';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSecurityScore = () => {
    let score = 60; // Base score
    if (user?.emailVerified) score += 15;
    if (securitySettings.twoFactorEnabled) score += 25;
    return Math.min(score, 100);
  };

  const secScore = calculateSecurityScore();

  const tabs = ['Overview', 'Activity Log', 'Settings'];

  if (show2FASetup) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Set Up Two-Factor Authentication</CardTitle>
            <p className="text-muted-foreground">Scan the QR code with your authenticator app</p>
          </CardHeader>
          <CardContent>

            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-background border border-border rounded-lg">
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    {qrCode ? (
                      <img src={qrCode} alt="2FA QR Code" className="w-full h-full" />
                    ) : (
                      <div className="text-muted-foreground">QR Code will appear here</div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Scan this QR code with Google Authenticator, Authy, or another TOTP app
                </p>
              </div>

              {backupCodes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Backup Codes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-center font-mono text-sm py-2 px-3 bg-background rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Verify Setup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code from your authenticator app to complete setup:
                </p>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <div className="mt-4 flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShow2FASetup(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerify2FA}
                    className="flex-1"
                    disabled={verificationCode.length !== 6 || isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Complete Setup'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <div className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Security Score</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your account security rating based on enabled features
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <Progress value={secScore} className="w-20 h-20 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">{secScore}</span>
                    </div>
                  </div>
                  <div>
                    <Badge variant={secScore >= 85 ? "default" : secScore >= 70 ? "secondary" : "destructive"}>
                      {secScore >= 85 ? 'Excellent' :
                        secScore >= 70 ? 'Good' : 'Needs improvement'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {securitySettings.twoFactorEnabled
                        ? 'Your account is protected with 2FA'
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                    <Button
                      onClick={securitySettings.twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                      variant={securitySettings.twoFactorEnabled ? "destructive" : "default"}
                      size="sm"
                      className="mt-3"
                      disabled={isLoading}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      {securitySettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Key className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Password Security</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Last changed 2 months ago</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get alerts about suspicious activity</p>
                    <div className="mt-3 flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.emailNotifications}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                      <span className="text-sm">{securitySettings.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Activity</CardTitle>
            <p className="text-muted-foreground">
              Monitor login attempts and security events on your account
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 text-2xl">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {getEventDescription(event)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.timestamp)} • {event.location} • {event.ipAddress}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Session Timeout
                    </h4>
                    <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
                  </div>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value)
                    }))}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Login Alerts
                    </h4>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))}
                    />
                    <span className="text-sm">{securitySettings.loginAlerts ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Your Data
                    </h4>
                    <p className="text-sm text-muted-foreground">Get a copy of your account data and activity</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Request Export
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </h4>
                    <p className="text-sm text-destructive">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}