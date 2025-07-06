'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/auth-provider';
import { Switch } from '@headlessui/react';

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

  const tabs = ['Overview', 'Activity Log', 'Settings'];

  if (show2FASetup) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Set Up Two-Factor Authentication</h2>
            <p className="mt-2 text-sm text-gray-600">Scan the QR code with your authenticator app</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  {qrCode ? (
                    <img src={qrCode} alt="2FA QR Code" className="w-full h-full" />
                  ) : (
                    <div className="text-gray-400">QR Code will appear here</div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Scan this QR code with Google Authenticator, Authy, or another TOTP app
              </p>
            </div>

            {backupCodes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Backup Codes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-center font-mono text-sm py-2 px-3 bg-white rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Setup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app to complete setup:
              </p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="block w-full text-center text-2xl tracking-widest rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => setShow2FASetup(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerify2FA} 
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={verificationCode.length !== 6 || isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels className="mt-6">
          {/* Overview Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Security Score */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Security Score</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Your account security rating based on enabled features
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-indigo-600"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + (calculateSecurityScore() / 100) * 50}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{calculateSecurityScore()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        {calculateSecurityScore() >= 85 ? '✅ Excellent' : 
                         calculateSecurityScore() >= 70 ? '🟡 Good' : '🔴 Needs improvement'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {securitySettings.twoFactorEnabled 
                          ? 'Your account is protected with 2FA'
                          : 'Add an extra layer of security to your account'
                        }
                      </p>
                      <button 
                        onClick={securitySettings.twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                        className={`mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          securitySettings.twoFactorEnabled
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                        }`}
                        disabled={isLoading}
                      >
                        {securitySettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <KeyIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Password Security</h3>
                      <p className="mt-1 text-sm text-gray-600">Last changed 2 months ago</p>
                      <button className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                      <p className="mt-1 text-sm text-gray-600">Get alerts about suspicious activity</p>
                      <div className="mt-3">
                        <Switch
                          checked={securitySettings.emailNotifications}
                          onChange={(checked) => setSecuritySettings(prev => ({ ...prev, emailNotifications: checked }))}
                          className={`${
                            securitySettings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              securitySettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Activity Log Panel */}
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Security Activity</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Monitor login attempts and security events on your account
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((event) => (
                  <div key={event.id} className="px-6 py-4 flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {getEventDescription(event)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.timestamp)} • {event.location} • {event.ipAddress}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* Settings Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
                      <p className="text-sm text-gray-600">Automatically log out after period of inactivity</p>
                    </div>
                    <select 
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev, 
                        sessionTimeout: parseInt(e.target.value)
                      }))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))}
                      className={`${
                        securitySettings.loginAlerts ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Privacy</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Download Your Data</h4>
                      <p className="text-sm text-gray-600">Get a copy of your account data and activity</p>
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Request Data Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}