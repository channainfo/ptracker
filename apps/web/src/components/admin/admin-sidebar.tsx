'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Logo } from '@/components/ui/logo';
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline';

/**
 * 📚 LEARNING: Navigation Menu Data Structure
 * 
 * Instead of hardcoding menu items in the component, we define them
 * as data. This makes it easy to add/remove items later.
 * 
 * Each menu item has:
 * - name: What to display
 * - href: Where to navigate when clicked
 * - icon: Visual indicator
 * - description: Tooltip text
 * 
 * Now displayed horizontally in a top navigation bar:
 * [Overview] [User Management] [Analytics] [Security] [Settings]
 */
const adminMenuItems = [
  {
    name: 'Overview',
    href: '/admin',
    icon: HomeIcon,
    description: 'Dashboard overview and key metrics'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UsersIcon,
    description: 'Manage user accounts and permissions'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    description: 'Application usage and performance metrics'
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: ShieldCheckIcon,
    description: 'Security settings and audit logs'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: CogIcon,
    description: 'System configuration and preferences'
  },
];

export function AdminSidebar() {
  // 📚 LEARNING: useState Hook for Component State
  // This creates a piece of state that belongs to this component
  // isMobileOpen: current value (true/false)
  // setIsMobileOpen: function to update the value
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 📚 LEARNING: Custom Hooks
  // These are special functions that give us access to Next.js and our auth system
  const pathname = usePathname(); // Gets current page URL
  const { user, logout } = useAuth(); // Gets user info and logout function

  /**
   * 📚 LEARNING: Event Handler Functions
   * 
   * These functions respond to user interactions like clicks
   */
  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen); // Toggle between true/false
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * 📚 LEARNING: Helper Functions
   * 
   * Pure functions that calculate values based on input
   * This one determines if a menu item should look "active"
   */
  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'; // Exact match for home
    }
    return pathname.startsWith(href); // Partial match for sub-pages
  };

  return (
    <>
      {/* 📚 LEARNING: Mobile Menu Button */}
      {/* This button only shows on small screens */}
      <button
        onClick={handleMobileToggle}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
        aria-label="Toggle admin menu"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* 📚 LEARNING: Mobile Overlay */}
      {/* This dark overlay appears behind the mobile menu */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)} // Close menu when overlay is clicked
        />
      )}

      {/* 📚 LEARNING: Top Navigation Bar */}
      {/* Desktop: horizontal nav bar, Mobile: slide-down menu */}
      <nav className={`
        w-full bg-card border-b border-border z-50
        md:block md:relative md:transform-none
        ${isMobileOpen ? 'block' : 'hidden'}
        md:shadow-none shadow-lg
      `}>

        {/* 📚 LEARNING: Navigation Header */}
        <div className="px-6 py-4 border-b border-border md:border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="sm" />
              <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                Admin
              </div>
            </div>

            {/* 📚 LEARNING: User Info Display */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 📚 LEARNING: Horizontal Navigation Menu */}
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-1 space-y-2 md:space-y-0">
            {adminMenuItems.map((item) => {
              const Icon = item.icon; // Get the icon component
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href} // React needs unique keys for list items
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)} // Close mobile menu when navigating
                  className={`
                    flex items-center px-4 py-2 rounded-lg transition-colors group
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                  title={item.description} // Tooltip on hover
                >
                  <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-primary-foreground' : 'text-current'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}