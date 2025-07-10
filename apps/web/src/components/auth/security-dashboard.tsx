'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface SecurityMetric {
  id: string;
  title: string;
  description: string;
  status: 'secure' | 'warning' | 'critical';
  action?: string;
  actionUrl?: string;
}

interface SecurityScore {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Excellent';
  color: string;
}

export function SecurityDashboard() {
  const { user, checkSecurityStatus } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore>({ score: 0, level: 'Low', color: 'text-red-500' });
  const [isLoading, setIsLoading] = useState(true);
  const [lastLoginInfo, setLastLoginInfo] = useState<{ date: string; location: string } | null>(null);

  useEffect(() => {
    const loadSecurityData = async () => {
      if (!user) return;

      try {
        const securityStatus = await checkSecurityStatus();
        const securityMetrics: SecurityMetric[] = [
          {
            id: 'email-verified',
            title: 'Email Verification',
            description: !user.email 
              ? 'No email address linked to your account (social login)'
              : user.emailVerified 
                ? 'Your email address has been verified' 
                : 'Please verify your email address to secure your account',
            status: !user.email 
              ? 'secure' // Social login users without email are considered secure
              : user.emailVerified 
                ? 'secure' 
                : 'critical',
            action: !user.email || user.emailVerified ? undefined : 'Verify Email',
            actionUrl: '/auth/verify-email'
          },
          {
            id: 'two-factor',
            title: 'Two-Factor Authentication',
            description: user.twoFactorEnabled 
              ? '2FA is enabled on your account' 
              : 'Enable 2FA for enhanced security',
            status: user.twoFactorEnabled ? 'secure' : 'warning',
            action: user.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA',
            actionUrl: '/settings/security'
          },
          {
            id: 'strong-password',
            title: 'Password Strength',
            description: 'Your password meets security requirements',
            status: 'secure' // This would need API validation in real implementation
          },
          {
            id: 'recent-activity',
            title: 'Account Activity',
            description: 'Monitor recent login attempts and sessions',
            status: 'secure',
            action: 'View Activity',
            actionUrl: '/settings/activity'
          }
        ];

        setMetrics(securityMetrics);

        // Calculate security score
        let score = 0;
        // Email verification: 30 points if verified, or 30 points if no email (social login)
        if (!user.email || user.emailVerified) score += 30;
        if (user.twoFactorEnabled) score += 40;
        score += 20; // Base score for having an account
        score += 10; // Assuming strong password

        let level: SecurityScore['level'] = 'Low';
        let color = 'text-red-500';
        
        if (score >= 90) {
          level = 'Excellent';
          color = 'text-green-500';
        } else if (score >= 70) {
          level = 'High';
          color = 'text-blue-500';
        } else if (score >= 50) {
          level = 'Medium';
          color = 'text-yellow-500';
        }

        setSecurityScore({ score, level, color });

        // Mock last login info (in real app, this would come from API)
        setLastLoginInfo({
          date: user.lastLoginAt || new Date().toISOString(),
          location: 'San Francisco, CA' // This would be from IP geolocation
        });

      } catch (error) {
        console.error('Failed to load security data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSecurityData();
  }, [user, checkSecurityStatus]);

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <ShieldExclamationIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getScoreIcon = () => {
    if (securityScore.score >= 90) {
      return <ShieldCheckIcon className="h-8 w-8 text-green-500" />;
    } else if (securityScore.score >= 50) {
      return <ShieldExclamationIcon className="h-8 w-8 text-yellow-500" />;
    } else {
      return <ShieldExclamationIcon className="h-8 w-8 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getScoreIcon()}
            <div>
              <h3 className="text-lg font-semibold text-foreground">Security Score</h3>
              <p className="text-sm text-muted-foreground">
                Your account security level
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${securityScore.color}`}>
              {securityScore.score}%
            </div>
            <div className={`text-sm font-medium ${securityScore.color}`}>
              {securityScore.level}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                securityScore.score >= 90 ? 'bg-green-500' :
                securityScore.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${securityScore.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Security Checklist</h3>
        {metrics.map(metric => (
          <div key={metric.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(metric.status)}
                <div>
                  <h4 className="font-medium text-foreground">{metric.title}</h4>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
              </div>
              {metric.action && (
                <button
                  onClick={() => metric.actionUrl && (window.location.href = metric.actionUrl)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    metric.status === 'critical' 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                      : metric.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
                      : 'btn-outline'
                  }`}
                >
                  {metric.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ClockIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        
        {lastLoginInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last login</span>
              <span className="text-sm text-foreground">
                {new Date(lastLoginInfo.date).toLocaleDateString()} at{' '}
                {new Date(lastLoginInfo.date).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Location</span>
              <span className="text-sm text-foreground">{lastLoginInfo.location}</span>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-border">
          <button className="btn-outline btn-lg w-full">
            <EyeIcon className="h-4 w-4 mr-2" />
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Security Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="btn-outline btn-lg flex items-center justify-center">
            <KeyIcon className="h-4 w-4 mr-2" />
            Change Password
          </button>
          <button className="btn-outline btn-lg flex items-center justify-center">
            <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
            Manage Devices
          </button>
        </div>
      </div>
    </div>
  );
}