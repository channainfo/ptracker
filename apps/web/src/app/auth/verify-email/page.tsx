import { Metadata } from 'next';
import { EmailVerificationForm } from '@/components/auth/email-verification-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Verify Email | CryptoTracker',
  description: 'Verify your email address to complete your CryptoTracker account setup',
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification link to your email address"
    >
      <EmailVerificationForm />
    </AuthLayout>
  );
}