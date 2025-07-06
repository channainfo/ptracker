'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient, ApiError } from '@/lib/api-client';

// Security constants
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'moderator' | 'admin';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  marketingEmails?: boolean;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  attempts: number;
}

export interface SecuritySettings {
  sessionTimeout: number;
  requireEmailVerification: boolean;
  twoFactorRequired: boolean;
  allowRememberMe: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requires2FA?: boolean;
  tempToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  securitySettings: SecuritySettings;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  complete2FALogin: (tempToken: string, code: string) => Promise<LoginResponse>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendEmailVerification: () => Promise<{ message: string }>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
  refreshSession: () => Promise<void>;
  checkSecurityStatus: () => Promise<{ isSecure: boolean; recommendations: string[] }>;
  getLoginAttempts: (email: string) => LoginAttempt | null;
  clearLoginAttempts: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Service Class using ApiClient
class AuthService {
  constructor() {
    // ApiClient handles token management automatically
  }

  async login(email: string, password: string, rememberMe = false): Promise<LoginResponse> {
    // Only send the basic required fields
    const loginData = { 
      email, 
      password
    };
    
    console.log('Logging in with data:', loginData);
    console.log('API URL:', apiClient['baseUrl']);
    
    try {
      const data = await apiClient.post<LoginResponse>('/auth/login', loginData);

      if (!data.requires2FA) {
        apiClient.setTokens(data.accessToken, data.refreshToken);
        this.setLastActivity();
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    // Only send the fields that the API expects
    const registrationData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password
    };
    
    console.log('Registering user with data:', registrationData);
    console.log('API URL:', apiClient['baseUrl']);
    
    try {
      const data = await apiClient.post<LoginResponse>('/auth/register', registrationData);
      apiClient.setTokens(data.accessToken, data.refreshToken);
      this.setLastActivity();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async complete2FALogin(tempToken: string, code: string): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>('/auth/2fa/login', { tempToken, token: code });

    apiClient.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async refreshTokens(): Promise<LoginResponse> {
    // ApiClient handles refresh automatically, but we can expose this method
    throw new Error('Token refresh is handled automatically by ApiClient');
  }

  async logout(): Promise<void> {
    if (apiClient.isAuthenticated()) {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    apiClient.clearTokens();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, password: newPassword });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post('/auth/verify-email', { token });
  }

  async resendEmailVerification(): Promise<{ message: string }> {
    return apiClient.post('/auth/resend-verification');
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/auth/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.put('/auth/change-password', { currentPassword, newPassword });
  }

  getAccessToken(): string | null {
    return apiClient.getAccessToken();
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  private setLastActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  }

  getLastActivity(): number {
    if (typeof window !== 'undefined') {
      const lastActivity = localStorage.getItem('lastActivity');
      return lastActivity ? parseInt(lastActivity, 10) : Date.now();
    }
    return Date.now();
  }

  isSessionExpired(): boolean {
    const lastActivity = this.getLastActivity();
    return Date.now() - lastActivity > INACTIVITY_TIMEOUT;
  }

  async refreshSession(): Promise<void> {
    if (this.isAuthenticated()) {
      this.setLastActivity();
      await this.getCurrentUser(); // Verify token is still valid
    }
  }

  async checkSecurityStatus(): Promise<{ isSecure: boolean; recommendations: string[] }> {
    const recommendations: string[] = [];
    const user = await this.getCurrentUser();
    
    if (!user.emailVerified) {
      recommendations.push('Verify your email address');
    }
    if (!user.twoFactorEnabled) {
      recommendations.push('Enable two-factor authentication');
    }
    
    return {
      isSecure: user.emailVerified && user.twoFactorEnabled,
      recommendations
    };
  }
}

// Create singleton instance
const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<Map<string, LoginAttempt>>(new Map());
  const [securitySettings] = useState<SecuritySettings>({
    sessionTimeout: INACTIVITY_TIMEOUT,
    requireEmailVerification: true,
    twoFactorRequired: false,
    allowRememberMe: true
  });
  const router = useRouter();

  // Initialize auth state with security checks
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Check if session has expired due to inactivity
          if (authService.isSessionExpired()) {
            await authService.logout();
            toast.error('Session expired due to inactivity. Please log in again.');
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }

          const userData = await authService.getCurrentUser();
          setUser(userData);
          // Update last activity handled internally
        } catch (error) {
          console.error('Failed to get current user:', error);
          await authService.logout();
        }
      }
      setIsLoading(false);
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Enhanced session management with activity tracking
  useEffect(() => {
    if (!authService.isAuthenticated() || !isInitialized) return;

    // Activity tracking for automatic logout
    const trackActivity = () => {
      // Activity tracking handled internally by authService
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    // Check session validity and activity
    const interval = setInterval(async () => {
      if (!apiClient.isAuthenticated()) {
        setUser(null);
        toast.error('Session expired. Please log in again.');
        return;
      }

      // Check for inactivity timeout
      if (authService.isSessionExpired()) {
        await logout();
        toast.error('Session expired due to inactivity.');
        return;
      }
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
    };
  }, [isInitialized, user]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    
    // Check for too many failed attempts
    const attempts = loginAttempts.get(email);
    if (attempts && attempts.attempts >= MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.timestamp;
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        const remainingLockout = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
        toast.error(`Account temporarily locked. Try again in ${remainingLockout} minutes.`);
        setIsLoading(false);
        throw new Error('Account temporarily locked');
      } else {
        // Reset attempts after lockout period
        setLoginAttempts(prev => {
          const newMap = new Map(prev);
          newMap.delete(email);
          return newMap;
        });
      }
    }

    try {
      const result = await authService.login(email, password, rememberMe);
      if (!result.requires2FA) {
        setUser(result.user);
        toast.success('Welcome back!');
        
        // Clear failed attempts on successful login
        setLoginAttempts(prev => {
          const newMap = new Map(prev);
          newMap.delete(email);
          return newMap;
        });
      }
      return result;
    } catch (error: ApiError | any) {
      // Track failed login attempts
      setLoginAttempts(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(email) || { email, timestamp: Date.now(), attempts: 0 };
        newMap.set(email, {
          ...current,
          attempts: current.attempts + 1,
          timestamp: Date.now()
        });
        return newMap;
      });

      const message = error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, loginAttempts]);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      toast.success('Account created successfully! Please verify your email.');
      router.push('/auth/verify-email');
      return result;
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const complete2FALogin = useCallback(async (tempToken: string, code: string) => {
    setIsLoading(true);
    try {
      const result = await authService.complete2FALogin(tempToken, code);
      setUser(result.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
      return result;
    } catch (error: any) {
      const message = error.message || '2FA verification failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const result = await authService.forgotPassword(email);
      toast.success('Password reset email sent');
      return result;
    } catch (error: any) {
      const message = error.message || 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const result = await authService.resetPassword(token, newPassword);
      toast.success('Password reset successfully');
      router.push('/auth/login');
      return result;
    } catch (error: any) {
      const message = error.message || 'Password reset failed';
      toast.error(message);
      throw error;
    }
  }, [router]);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const result = await authService.verifyEmail(token);
      
      // Update user state to reflect verified email
      if (user) {
        setUser({ ...user, emailVerified: true });
      }
      
      toast.success('Email verified successfully');
      return result;
    } catch (error: any) {
      const message = error.message || 'Email verification failed';
      toast.error(message);
      throw error;
    }
  }, [user]);

  const resendEmailVerification = useCallback(async () => {
    try {
      const result = await authService.resendEmailVerification();
      toast.success('Verification email sent');
      return result;
    } catch (error: any) {
      const message = error.message || 'Failed to send verification email';
      toast.error(message);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error: any) {
      const message = error.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      
      // Force logout on other devices for security
      await authService.logout();
      toast('Please log in again with your new password for security.', { icon: 'ℹ️' });
      router.push('/auth/login');
      
      return result;
    } catch (error: any) {
      const message = error.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      await authService.refreshSession();
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  }, []);

  const checkSecurityStatus = useCallback(async () => {
    try {
      return await authService.checkSecurityStatus();
    } catch (error) {
      console.error('Security status check failed:', error);
      return { isSecure: false, recommendations: ['Unable to check security status'] };
    }
  }, []);

  const getLoginAttempts = useCallback((email: string) => {
    return loginAttempts.get(email) || null;
  }, [loginAttempts]);

  const clearLoginAttempts = useCallback((email: string) => {
    setLoginAttempts(prev => {
      const newMap = new Map(prev);
      newMap.delete(email);
      return newMap;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    securitySettings,
    login,
    register,
    logout,
    complete2FALogin,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    updateProfile,
    changePassword,
    refreshSession,
    checkSecurityStatus,
    getLoginAttempts,
    clearLoginAttempts,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for protected pages
export const useRequireAuth = (redirectTo: string = '/auth/login') => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, isInitialized, redirectTo, router]);

  return { isAuthenticated, isLoading: isLoading || !isInitialized };
};

// Hook for role-based access
export const useRoleAccess = (requiredRole: 'user' | 'moderator' | 'admin') => {
  const { user } = useAuth();
  
  const hasAccess = useCallback(() => {
    if (!user) return false;
    
    const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }, [user, requiredRole]);

  return hasAccess();
};