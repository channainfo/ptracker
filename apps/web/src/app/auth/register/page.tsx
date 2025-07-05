import { Metadata } from 'next';
import { ImprovedRegisterForm } from '@/components/auth/improved-register-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Create Account | CryptoTracker',
  description: 'Create your CryptoTracker account to start tracking your cryptocurrency portfolio',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of crypto investors using CryptoTracker to manage their portfolios"
    >
      <ImprovedRegisterForm />
    </AuthLayout>
  );
}