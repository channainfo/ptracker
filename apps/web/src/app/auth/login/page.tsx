import { Metadata } from 'next';
import { ImprovedLoginForm } from '@/components/auth/improved-login-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Sign In | PTracker',
  description: 'Sign in to your PTracker account to manage your cryptocurrency portfolio',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue tracking your crypto portfolio"
    >
      <ImprovedLoginForm />
    </AuthLayout>
  );
}