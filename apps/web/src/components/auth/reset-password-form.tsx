'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/auth-provider';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?\":{}|<>]/.test(p) },
];

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    const validRequirements = passwordRequirements.filter(req => req.test(password));
    setPasswordStrength(validRequirements.length);
  }, [password]);

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength < 5) {
      setError('Password must meet all security requirements.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      // The auth provider will redirect to login page
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
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
          <h2 className="mt-4 text-2xl font-bold text-foreground">Password reset successful!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="btn-primary w-full py-2 px-4 text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/auth/forgot-password"
            className="btn-primary w-full py-2 px-4 text-center"
          >
            Request New Reset Link
          </Link>
          <Link
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="text-sm text-destructive">
              <p className="font-medium">Reset failed</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="form-label text-foreground"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`input pr-10 ${passwordStrength >= 5 ? 'border-green-500' : ''}`}
                placeholder="Enter your new password"
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-3 mt-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordStrength).replace('bg-', 'text-')}`}>
                    {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(password);
                    return (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {isValid ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={isValid ? 'text-green-600' : 'text-muted-foreground'}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="form-label text-foreground"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`input pr-10 ${
                  confirmPassword && password === confirmPassword ? 'border-green-500' : ''
                }`}
                placeholder="Confirm your new password"
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
            {confirmPassword && password === confirmPassword && (
              <p className="text-sm text-green-600 mt-1">✓ Passwords match</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="btn-primary w-full py-2 px-4 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Resetting password...</span>
            </div>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}