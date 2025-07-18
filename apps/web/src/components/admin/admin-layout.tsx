'use client';

import { AdminRoute } from './admin-route';
import { AdminSidebar } from './admin-sidebar';

/**
 * 📚 LEARNING: Layout Component Pattern
 * 
 * This is a common React pattern where we create a "wrapper" component
 * that provides consistent structure for multiple pages.
 * 
 * Think of it like a template:
 * - Every admin page will have the same sidebar (now on top)
 * - Every admin page will have the same security check
 * - Only the main content area changes
 * 
 * This way, we write the layout code once and reuse it everywhere!
 * 
 * Layout Structure:
 * ┌─────────────────────────────────────┐
 * │           SIDEBAR (TOP)             │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │         MAIN CONTENT               │
 * │                                     │
 * └─────────────────────────────────────┘
 */

interface AdminLayoutProps {
  children: React.ReactNode; // The main content that changes between pages
  title?: string;           // Optional page title
  subtitle?: string;        // Optional page description
}

export function AdminLayout({
  children,
  title,
  subtitle
}: AdminLayoutProps) {
  return (
    // 📚 LEARNING: AdminRoute Wrapper
    // This automatically checks if user is admin before showing anything
    <AdminRoute>
      {/* 📚 LEARNING: Vertical Layout */}
      {/* This creates a layout with sidebar on top and content below */}
      <div className="min-h-screen bg-background flex flex-col">

        {/* Top Navigation Bar - Previously sidebar, now horizontal */}
        <AdminSidebar />

        {/* 📚 LEARNING: Main Content Area */}
        {/* No margin needed - content flows below sidebar */}
        <main className="flex-1 min-h-0">

          {/* 📚 LEARNING: Page Header */}
          {/* Only show if title is provided */}
          {(title || subtitle) && (
            <header className="bg-card border-b border-border px-6 py-4">
              <div className="max-w-7xl mx-auto">
                {title && (
                  <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </header>
          )}

          {/* 📚 LEARNING: Content Container */}
          {/* This is where the actual page content goes */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>

        </main>
      </div>
    </AdminRoute>
  );
}

/**
 * 📚 LEARNING: Specialized Layout Components
 * 
 * We can create more specific layouts for different types of admin pages.
 * This shows how to extend the base layout with additional features.
 */

interface AdminPageLayoutProps extends AdminLayoutProps {
  showBackButton?: boolean;
  backUrl?: string;
  actions?: React.ReactNode; // Custom action buttons for the page
}

export function AdminPageLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backUrl = '/admin',
  actions
}: AdminPageLayoutProps) {
  return (
    <AdminLayout>
      {/* Enhanced header with back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
              title="Go back"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Custom action buttons */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>

      {children}
    </AdminLayout>
  );
}

/**
 * 📚 LEARNING: Why This Pattern is Powerful
 * 
 * Now any admin page can be created like this:
 * 
 * function MyAdminPage() {
 *   return (
 *     <AdminLayout title="My Page" subtitle="Page description">
 *       <div>My page content here</div>
 *     </AdminLayout>
 *   );
 * }
 * 
 * And it automatically gets:
 * ✅ Admin-only access control
 * ✅ Consistent sidebar navigation
 * ✅ Responsive mobile design
 * ✅ Proper page structure
 * ✅ User info display
 * ✅ Logout functionality
 */