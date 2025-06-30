import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your CryptoTracker account',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
}