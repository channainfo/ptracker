import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Forgot Password | CryptoTracker',
  description: 'Reset your CryptoTracker account password',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}