'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requires2FA?: boolean;
  tempToken?: string;
}

// Auth Service Class
class AuthService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = '/api/auth') {
    this.baseUrl = baseUrl;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if we have a token
    if (this.accessToken && !endpoint.includes('/refresh')) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    let response = await fetch(url, config);

    // Handle token refresh
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/refresh')) {
      try {
        await this.refreshTokens();
        
        // Retry the original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.accessToken}`,
        };
        response = await fetch(url, config);
      } catch (refreshError) {
        this.clearTokens();
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!data.requires2FA) {
      this.setTokens(data.accessToken, data.refreshToken);
    }

    return data;
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const data = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async complete2FALogin(tempToken: string, code: string): Promise<LoginResponse> {
    const data = await this.makeRequest('/auth/2fa/login', {
      method: 'POST',
      body: JSON.stringify({ tempToken, token: code }),
    });

    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async refreshTokens(): Promise<LoginResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.makeRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    this.clearTokens();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.makeRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// Create singleton instance
const authService = new AuthService();

// Main authentication hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
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

  // Set up periodic token refresh
  useEffect(() => {
    if (!authService.isAuthenticated() || !isInitialized) return;

    const interval = setInterval(async () => {
      try {
        await authService.refreshTokens();
      } catch (error) {
        console.error('Token refresh failed:', error);
        setUser(null);
        toast.error('Session expired. Please log in again.');
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(interval);
  }, [isInitialized, user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (!result.requires2FA) {
        setUser(result.user);
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
      return result;
    } catch (error: any) {
      const message = error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
      return result;
    } catch (error: any) {
      const message = error.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    complete2FALogin,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    changePassword,
  };
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

// Hook for authenticated API requests
export const useAuthenticatedRequest = () => {
  const { logout } = useAuth();
  
  const makeRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = authService.getAccessToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      await logout();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [logout]);

  return makeRequest;
};

export default useAuth;