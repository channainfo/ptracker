'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/auth-provider';

// Enhanced email validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(email => email.trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false)
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export function ImprovedLoginForm({ redirectTo, onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const { login, complete2FALogin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get redirect URL from search params or use default
  const finalRedirectTo = redirectTo || searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  // Watch form values for real-time validation feedback
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Handle account lockout countdown
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttemptCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Enhanced error messages
  const getErrorMessage = (error: any) => {
    if (error?.message?.includes('credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error?.message?.includes('locked')) {
      return 'Your account has been temporarily locked due to multiple failed attempts.';
    }
    if (error?.message?.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) return;

    try {
      clearErrors();
      const result = await login(data.email, data.password, data.rememberMe);
      
      if (result.requires2FA) {
        setShow2FA(true);
        setTempToken(result.tempToken || '');
      } else {
        setAttemptCount(0);
        onSuccess?.();
        router.push(finalRedirectTo);
      }
    } catch (error: any) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // Implement progressive lockout
      if (newAttemptCount >= 5) {
        setIsLocked(true);
        setLockoutTime(300); // 5 minutes
        setError('root', { 
          message: 'Too many failed attempts. Account locked for 5 minutes.' 
        });
      } else if (newAttemptCount >= 3) {
        const remainingAttempts = 5 - newAttemptCount;
        setError('root', { 
          message: `${getErrorMessage(error)} ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.` 
        });
      } else {
        setError('root', { message: getErrorMessage(error) });
      }
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (twoFactorCode.length !== 6) {
      setError('root', { message: 'Please enter a complete 6-digit code.' });
      return;
    }

    try {
      await complete2FALogin(tempToken, twoFactorCode);
      onSuccess?.();
      router.push(finalRedirectTo);
    } catch (error: any) {
      setError('root', { message: getErrorMessage(error) });
      setTwoFactorCode('');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      // Add security validation for redirect URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const socialUrl = new URL(`/auth/${provider}`, baseUrl);
      socialUrl.searchParams.set('redirect', finalRedirectTo);
      
      window.location.href = socialUrl.toString();
    } catch (error) {
      setSocialLoading(null);
      setError('root', { message: 'Failed to initialize social login. Please try again.' });
    }
  };

  // Real-time validation indicators
  const emailIsValid = watchedEmail && !errors.email && watchedEmail.includes('@');
  const passwordIsValid = watchedPassword && !errors.password && watchedPassword.length >= 6;

  if (show2FA) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to complete your login
          </p>
        </div>

        <form onSubmit={handle2FASubmit} className="space-y-6">
          <div>
            <label htmlFor="twoFactorCode" className="form-label">
              Authentication Code
            </label>
            <div className="relative">
              <input
                type="text"
                id="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                disabled={isLoading}
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <DevicePhoneMobileIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Code expires in 30 seconds
            </p>
          </div>

          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
                <div className="ml-3">
                  <p className="text-sm text-destructive">{errors.root.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShow2FA(false)}
              className="btn-outline flex-1"
              disabled={isLoading}
            >
              Back to Login
            </button>
            <button
              type="submit"
              className="btn-primary btn-lg flex-1"
              disabled={isLoading || twoFactorCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className={`input pr-10 ${errors.email ? 'border-destructive' : emailIsValid ? 'border-green-500' : ''}`}
              placeholder="Enter your email"
              disabled={isLoading || isLocked}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {emailIsValid && (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input pr-20 ${errors.password ? 'border-destructive' : passwordIsValid ? 'border-green-500' : ''}`}
              placeholder="Enter your password"
              disabled={isLoading || isLocked}
            />
            <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
              {passwordIsValid && (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              id="rememberMe"
              type="checkbox"
              className="checkbox"
              disabled={isLoading || isLocked}
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-foreground">
              Remember me for 30 days
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error Display */}
        {errors.root && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
              <div className="ml-3">
                <p className="text-sm text-destructive">{errors.root.message}</p>
                {isLocked && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Account unlocks in {Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          className="btn-primary btn-lg w-full"
          disabled={isLoading || isSubmitting || isLocked}
        >
          {isLoading ? 'Signing in...' : isLocked ? 'Account Locked' : 'Sign in'}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="btn-outline btn-lg"
            disabled={isLoading || socialLoading === 'google'}
          >
            {socialLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="ml-2">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="btn-outline btn-lg"
            disabled={isLoading || socialLoading === 'facebook'}
          >
            {socialLoading === 'facebook' ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            <span className="ml-2">Facebook</span>
          </button>
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}