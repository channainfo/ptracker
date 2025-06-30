import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your CryptoTracker account',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your crypto journey with CryptoTracker"
    >
      <RegisterForm />
    </AuthLayout>
  );
}