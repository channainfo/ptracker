'use client';

import { useEffect, useState } from 'react';
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
  const { isAuthenticated, isLoading, isInitialized, user, resendEmailVerification } = useAuth();
  const hasRequiredRole = useRoleAccess(requiredRole);
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  const handleRequestNewVerification = async () => {
    if (isResending) return;
    
    setIsResending(true);
    try {
      await resendEmailVerification();
      // After successfully sending email, redirect to verification page with sent parameter
      router.push('/auth/verify-email?sent=true');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      // Still redirect to verification page so user can try again
      router.push('/auth/verify-email');
    } finally {
      setIsResending(false);
    }
  };

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
  // Skip email verification requirement for:
  // 1. Social login users (Google, Facebook, Telegram)
  // 2. Users who don't have an email address
  // 3. Users whose email is already verified by social providers
  const isSocialLogin = user?.authProvider && ['google', 'facebook', 'telegram'].includes(user.authProvider);
  const hasEmail = user?.email && user.email.trim() !== '' && !user.email.includes('@ptracker.local');
  
  const shouldRequireEmailVerification = user && 
    !user.emailVerified && 
    hasEmail && // Only require verification if user has a real email
    !isSocialLogin && // Skip verification for social login users
    typeof window !== 'undefined' && 
    window.location.pathname !== '/auth/verify-email';

  if (shouldRequireEmailVerification) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
              <div className="card">
                <div className="flex flex-col items-center text-center p-6">
                  {/* Email verification icon */}
                  <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground mb-2">
                    Email Verification Required
                  </h1>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6">
                    Please verify your email address to continue using PTracker. We've sent a verification link to your email.
                  </p>
                  
                  {/* Warning alert */}
                  <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Verification Required</p>
                        <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                          Your account access is limited until your email is verified.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={() => router.push('/auth/verify-email')}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 rounded-md font-medium transition-colors"
                    >
                      Verify Email
                    </button>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="flex-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 rounded-md font-medium transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                  
                  {/* Help text */}
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={handleRequestNewVerification}
                      disabled={isResending}
                      className="text-primary hover:text-primary/80 underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? 'sending...' : 'request a new one'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}