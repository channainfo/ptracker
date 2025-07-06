'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/auth-provider';

// Enhanced registration schema with better validation
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(name => name.trim()),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(name => name.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(email => email.trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?\":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions'),
  marketingEmails: z.boolean().optional().default(false)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  icon: typeof CheckIcon;
}

interface FormStep {
  id: number;
  title: string;
  description: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8, icon: CheckIcon },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p), icon: CheckIcon },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p), icon: CheckIcon },
  { label: 'One number', test: (p) => /\d/.test(p), icon: CheckIcon },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?\":{}|<>]/.test(p), icon: CheckIcon },
];

const formSteps: FormStep[] = [
  { id: 1, title: 'Personal Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Security', description: 'Secure your account' },
  { id: 3, title: 'Preferences', description: 'Customize your experience' }
];

export function ImprovedRegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
    trigger
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      marketingEmails: false,
      agreeToTerms: false
    }
  });

  const watchedPassword = watch('password', '');
  const watchedConfirmPassword = watch('confirmPassword', '');
  const watchedEmail = watch('email', '');
  const watchedFirstName = watch('firstName', '');
  const watchedLastName = watch('lastName', '');

  // Calculate password strength
  useEffect(() => {
    const validRequirements = passwordRequirements.filter(req => req.test(watchedPassword));
    setPasswordStrength(validRequirements.length);
  }, [watchedPassword]);

  // Check email availability with debouncing
  useEffect(() => {
    if (!watchedEmail || errors.email) {
      setEmailAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        // Simulate email availability check
        // In real implementation, this would call your API
        const isAvailable = !watchedEmail.includes('taken'); // Mock logic
        setEmailAvailable(isAvailable);
        if (!isAvailable) {
          setError('email', { message: 'This email is already registered' });
        } else {
          clearErrors('email');
        }
      } catch (error) {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail, errors.email, setError, clearErrors]);

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

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return watchedFirstName && watchedLastName && watchedEmail && emailAvailable && !errors.firstName && !errors.lastName && !errors.email;
      case 3:
        return watchedPassword && watchedConfirmPassword && passwordStrength >= 4 && !errors.password && !errors.confirmPassword;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email'];
        break;
      case 2:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid && canProceedToStep(currentStep + 1)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        marketingEmails: data.marketingEmails
      });
      
      router.push('/auth/verify-email');
    } catch (error: any) {
      if (error.message.includes('email already exists')) {
        setError('email', { message: 'An account with this email already exists' });
        setCurrentStep(1);
      } else {
        setError('root', { message: error.message || 'Registration failed. Please try again.' });
      }
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const socialUrl = new URL(`/auth/${provider}`, baseUrl);
      socialUrl.searchParams.set('action', 'register');
      
      window.location.href = socialUrl.toString();
    } catch (error) {
      setSocialLoading(null);
      setError('root', { message: 'Failed to initialize social registration. Please try again.' });
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {formSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              currentStep >= step.id 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              {currentStep > step.id ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            {index < formSteps.length - 1 && (
              <div className={`w-12 h-0.5 mx-3 transition-all duration-200 ${
                currentStep > step.id ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-foreground">{formSteps[currentStep - 1].title}</h3>
        <p className="text-sm text-muted-foreground">{formSteps[currentStep - 1].description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="form-label">
                  First name
                </label>
                <div className="relative">
                  <input
                    {...register('firstName')}
                    type="text"
                    autoComplete="given-name"
                    className={`input pl-10 ${errors.firstName ? 'border-destructive' : watchedFirstName && !errors.firstName ? 'border-green-500' : ''}`}
                    placeholder="John"
                    disabled={isLoading}
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  {watchedFirstName && !errors.firstName && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="form-label">
                  Last name
                </label>
                <div className="relative">
                  <input
                    {...register('lastName')}
                    type="text"
                    autoComplete="family-name"
                    className={`input pl-10 ${errors.lastName ? 'border-destructive' : watchedLastName && !errors.lastName ? 'border-green-500' : ''}`}
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  {watchedLastName && !errors.lastName && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.lastName && (
                  <p className="form-error">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`input pl-10 pr-10 ${
                    errors.email ? 'border-destructive' : 
                    emailAvailable ? 'border-green-500' : 
                    emailAvailable === false ? 'border-destructive' : ''
                  }`}
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingEmail ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : emailAvailable ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : emailAvailable === false ? (
                    <XMarkIcon className="h-5 w-5 text-destructive" />
                  ) : null}
                </div>
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
              {emailAvailable && (
                <p className="text-sm text-green-600">✓ Email is available</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Security */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-10 ${errors.password ? 'border-destructive' : passwordStrength >= 4 ? 'border-green-500' : ''}`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
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
              {watchedPassword && (
                <div className="space-y-3">
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
                      const isValid = req.test(watchedPassword);
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

              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-10 ${
                    errors.confirmPassword ? 'border-destructive' : 
                    watchedConfirmPassword && watchedPassword === watchedConfirmPassword ? 'border-green-500' : ''
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
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
              {watchedConfirmPassword && watchedPassword === watchedConfirmPassword && (
                <p className="text-sm text-green-600">✓ Passwords match</p>
              )}
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  {...register('agreeToTerms')}
                  id="agreeToTerms"
                  type="checkbox"
                  className="checkbox mt-0.5"
                  disabled={isLoading}
                />
                <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-primary/80 underline" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary/80 underline" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="form-error ml-7">{errors.agreeToTerms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  {...register('marketingEmails')}
                  id="marketingEmails"
                  type="checkbox"
                  className="checkbox mt-0.5"
                  disabled={isLoading}
                />
                <label htmlFor="marketingEmails" className="ml-3 block text-sm text-foreground">
                  Send me updates about new features, market insights, and educational content
                  <span className="text-muted-foreground block text-xs mt-1">
                    You can unsubscribe at any time
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Your account security
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    We'll send you a verification email to confirm your account and enable two-factor authentication for enhanced security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
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

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="btn-outline btn-lg"
              disabled={isLoading}
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary btn-lg"
              disabled={!canProceedToStep(currentStep + 1)}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={isLoading || !isValid}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          )}
        </div>

        {/* Social Registration - Only show on first step */}
        {currentStep === 1 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialRegister('google')}
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
                onClick={() => handleSocialRegister('facebook')}
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
          </>
        )}
      </form>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}