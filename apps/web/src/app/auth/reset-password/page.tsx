import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Reset Password | PTracker',
  description: 'Reset your PTracker account password',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}