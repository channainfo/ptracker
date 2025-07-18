'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';

/**
 * 📚 LEARNING: Higher-Order Component (HOC)
 * 
 * This component wraps other components to add admin-only access control.
 * Think of it as a security guard that checks if someone is an admin
 * before letting them see the admin pages.
 * 
 * How it works:
 * 1. It receives 'children' (the admin page content) as props
 * 2. It checks if the user is authenticated and has admin role
 * 3. If yes, it shows the children (admin content)
 * 4. If no, it redirects them away or shows an error
 */

interface AdminRouteProps {
  children: React.ReactNode; // This is TypeScript saying "any React component or content"
  fallbackUrl?: string;      // Where to redirect if not admin (optional)
}

export function AdminRoute({ 
  children, 
  fallbackUrl = '/dashboard' 
}: AdminRouteProps) {
  // 📚 LEARNING: useAuth Hook
  // This gets the current user information from our auth system
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  
  // 📚 LEARNING: useRouter Hook  
  // This lets us navigate to different pages programmatically
  const router = useRouter();

  // 📚 LEARNING: useEffect Hook
  // This runs code when the component loads or when dependencies change
  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (!isInitialized || isLoading) return;

    // Check 1: Is the user logged in?
    if (!isAuthenticated) {
      console.log('❌ Admin Access Denied: User not authenticated');
      router.push('/auth/login');
      return;
    }

    // Check 2: Does the user have admin role?
    if (user?.role !== 'admin') {
      console.log('❌ Admin Access Denied: User role is', user?.role, 'but admin required');
      router.push(fallbackUrl);
      return;
    }

    // ✅ All checks passed - user is admin
    console.log('✅ Admin Access Granted for user:', user.firstName, user.lastName);
    
  }, [isAuthenticated, isLoading, isInitialized, user, router, fallbackUrl]);

  // 📚 LEARNING: Conditional Rendering
  // We show different things based on the current state

  // Show loading spinner while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Don't show anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show access denied message if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need administrator privileges to access this area.
          </p>
          <button
            onClick={() => router.push(fallbackUrl)}
            className="btn-primary px-6 py-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 🎉 Success! User is admin, show the admin content
  return <>{children}</>;
}