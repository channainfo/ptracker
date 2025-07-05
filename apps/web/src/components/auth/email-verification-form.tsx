'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export function EmailVerificationForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, verifyEmail, resendEmailVerification, isAuthenticated } = useAuth();
  
  const token = searchParams.get('token');

  // Handle email verification on component mount if token is present
  useEffect(() => {
    if (token && !isVerified && !isVerifying) {
      handleVerification(token);
    }
  }, [token]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerification = async (verificationToken: string) => {
    setIsVerifying(true);
    setError('');
    
    try {
      await verifyEmail(verificationToken);
      setIsVerified(true);
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Email verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await resendEmailVerification();
      setResendCooldown(60); // 60 second cooldown
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    }
  };

  // If user is already verified, show success message
  if (user?.emailVerified) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Email verified!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your email address has been successfully verified.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="btn-primary btn-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Verification successful
  if (isVerified) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Email verified!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your email address has been successfully verified. Redirecting to dashboard...
          </p>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Currently verifying
  if (isVerifying) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Verifying email...</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  // Default state - waiting for verification
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <svg
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We've sent a verification link to{' '}
          <strong className="text-foreground">{user?.email || 'your email address'}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="text-sm text-destructive">
            <p className="font-medium">Verification failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-2 text-blue-800 dark:text-blue-200">Didn't receive the email?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>The email might take a few minutes to arrive</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {isAuthenticated && (
          <button
            onClick={handleResendVerification}
            disabled={resendCooldown > 0}
            className="btn-outline btn-lg w-full disabled:opacity-50"
          >
            {resendCooldown > 0
              ? `Resend email in ${resendCooldown}s`
              : 'Resend verification email'
            }
          </button>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth/login"
            className="btn-outline btn-lg flex-1 text-center"
          >
            Sign in with different account
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary btn-lg flex-1 text-center"
          >
            Continue to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}