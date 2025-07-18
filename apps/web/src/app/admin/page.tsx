'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * 📚 LEARNING: TypeScript Interfaces for Data
 * 
 * Before we handle data, we define its "shape" using TypeScript.
 * This helps catch errors and makes code more reliable.
 */
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalTransactions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

/**
 * 📚 LEARNING: Stat Card Component
 * 
 * This is a "sub-component" - a small, reusable piece of UI.
 * Instead of repeating the same card design 4 times, we create
 * one component and reuse it with different data.
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // TypeScript for icon components
  color: 'blue' | 'green' | 'yellow' | 'red';
  description?: string;
}

function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  // 📚 LEARNING: Dynamic CSS Classes
  // We change colors based on the 'color' prop
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * 📚 LEARNING: Main Admin Dashboard Component
 */
export default function AdminDashboard() {
  // 📚 LEARNING: State Management for Data and Loading
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📚 LEARNING: Data Fetching with useEffect
  useEffect(() => {
    /**
     * 📚 LEARNING: Async Function Inside useEffect
     * 
     * We can't make useEffect itself async, so we create an async function inside it.
     * This is a common pattern for data fetching in React.
     */
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 📚 LEARNING: Mock Data for Development
        // In a real app, this would be an API call
        // For learning, we'll simulate an API with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        // Mock data that looks like what an API might return
        const mockStats: DashboardStats = {
          totalUsers: 1247,
          activeUsers: 892,
          newUsersToday: 23,
          totalTransactions: 15678,
          systemHealth: 'healthy',
          lastUpdated: new Date().toISOString(),
        };

        setStats(mockStats);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means "run once when component mounts"

  // 📚 LEARNING: Helper Functions for Data Formatting
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'blue';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'critical': return ExclamationTriangleIcon;
      default: return ChartBarIcon;
    }
  };

  // 📚 LEARNING: Loading State UI
  if (isLoading) {
    return (
      <AdminLayout 
        title="Admin Dashboard" 
        subtitle="Overview of system metrics and user activity"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Loading skeleton cards */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-muted rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

  // 📚 LEARNING: Error State UI
  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to Load Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-4 py-2"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  // 📚 LEARNING: Success State UI - The Main Dashboard
  return (
    <AdminLayout 
      title="Admin Dashboard" 
      subtitle="Overview of system metrics and user activity"
    >
      {/* 📚 LEARNING: CSS Grid for Responsive Layout */}
      {/* This creates a grid that adapts to screen size:
          - 1 column on mobile
          - 2 columns on medium screens  
          - 4 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <StatCard
          title="Total Users"
          value={formatNumber(stats!.totalUsers)}
          icon={UsersIcon}
          color="blue"
          description="Registered accounts"
        />
        
        <StatCard
          title="Active Users"
          value={formatNumber(stats!.activeUsers)}
          icon={UsersIcon}
          color="green"
          description="Last 30 days"
        />
        
        <StatCard
          title="New Today"
          value={formatNumber(stats!.newUsersToday)}
          icon={UsersIcon}
          color="yellow"
          description="New registrations"
        />
        
        <StatCard
          title="System Health"
          value={stats!.systemHealth}
          icon={getSystemHealthIcon(stats!.systemHealth)}
          color={getSystemHealthColor(stats!.systemHealth) as any}
          description="Current status"
        />
      </div>

      {/* 📚 LEARNING: Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Panel */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Mock activity items */}
            {[
              { action: 'New user registration', user: 'john.doe@example.com', time: '2 minutes ago' },
              { action: 'Password reset request', user: 'jane.smith@example.com', time: '15 minutes ago' },
              { action: 'Account verification', user: 'mike.johnson@example.com', time: '1 hour ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <p className="font-medium text-foreground">Manage Users</p>
              <p className="text-sm text-muted-foreground">View and edit user accounts</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <p className="font-medium text-foreground">System Settings</p>
              <p className="text-sm text-muted-foreground">Configure application settings</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <p className="font-medium text-foreground">View Analytics</p>
              <p className="text-sm text-muted-foreground">Detailed usage statistics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(stats!.lastUpdated).toLocaleString()}
        </p>
      </div>
    </AdminLayout>
  );
}

/**
 * 📚 LEARNING: What You've Learned So Far
 * 
 * 🎯 React Concepts:
 * ✅ Component composition (AdminLayout wrapping content)
 * ✅ Props and prop types with TypeScript
 * ✅ State management with useState
 * ✅ Side effects with useEffect
 * ✅ Conditional rendering (loading, error, success states)
 * ✅ Event handling (onClick)
 * ✅ CSS classes and responsive design
 * 
 * 🎯 Next.js Concepts:
 * ✅ File-based routing (/admin/page.tsx = /admin route)
 * ✅ Client-side components ('use client')
 * 
 * 🎯 Development Patterns:
 * ✅ Separation of concerns (layout vs content)
 * ✅ Reusable components (StatCard)
 * ✅ Mock data for development
 * ✅ Error handling and loading states
 * ✅ TypeScript for type safety
 * 
 * Next, we'll create a user management page that shows how to work with lists of data!
 */