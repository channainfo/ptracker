import { Metadata } from 'next';
import { SecurityDashboard } from '@/components/settings/security-dashboard';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

export const metadata: Metadata = {
  title: 'Security Settings - PTracker',
  description: 'Manage your account security settings and monitor security activity',
};

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Security & Privacy</h1>
            <p className="text-muted-foreground">
              Manage your account security settings and monitor security activity
            </p>
          </div>
          <SecurityDashboard />
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}