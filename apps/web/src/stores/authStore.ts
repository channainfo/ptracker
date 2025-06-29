import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  tier: 'NOVICE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'LEGEND';
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            token: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Successfully logged in!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.message || 'Login failed');
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
          }

          const result = await response.json();
          set({
            user: result.user,
            token: result.access_token,
            refreshToken: result.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Account created successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        toast.success('Logged out successfully');
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          set({
            token: data.access_token,
            refreshToken: data.refresh_token,
          });
        } catch (error) {
          get().logout();
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);