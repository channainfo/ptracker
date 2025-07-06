import { Metadata } from 'next';
import { SecurityDashboard } from '@/components/settings/security-dashboard';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'Security Settings | CryptoTracker',
  description: 'Manage your account security settings and monitor security activity',
};

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Security & Privacy</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your account security settings and monitor activity
              </p>
            </div>
            <SecurityDashboard />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}