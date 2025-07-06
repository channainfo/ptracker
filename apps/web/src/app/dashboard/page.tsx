import { Metadata } from 'next';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your crypto portfolio dashboard with real-time insights and analytics.',
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <DashboardLayout />
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}