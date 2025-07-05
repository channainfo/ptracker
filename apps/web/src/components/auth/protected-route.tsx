'use client';

import { useEffect } from 'react';
import { useAuth, useRoleAccess } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'moderator' | 'admin';
  fallbackUrl?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallbackUrl = '/auth/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const hasRequiredRole = useRoleAccess(requiredRole);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackUrl);
      } else if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, hasRequiredRole, router, fallbackUrl]);

  // Show loading spinner while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  // Authenticated but insufficient role
  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary btn-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if email is verified for certain routes
  if (user && !user.emailVerified && typeof window !== 'undefined' && window.location.pathname !== '/auth/verify-email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h1 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">Email Verification Required</h1>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Please verify your email address to continue using CryptoTracker.
            </p>
            <button
              onClick={() => router.push('/auth/verify-email')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 text-base rounded-md transition-colors font-medium"
            >
              Verify Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}