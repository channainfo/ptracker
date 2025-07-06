'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChartBarIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const navigationItems = isAuthenticated ? [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Portfolio', href: '/portfolio', icon: ChartBarIcon },
    { name: 'Market', href: '/market', icon: CurrencyDollarIcon },
    { name: 'Learn', href: '/learn', icon: AcademicCapIcon },
  ] : [
    { name: 'Market', href: '/market', icon: CurrencyDollarIcon },
    { name: 'Learn', href: '/learn', icon: AcademicCapIcon },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const settingsMenuItems = [
    { name: 'Profile', href: '/settings/profile', icon: UserIcon },
    { name: 'Security', href: '/settings/security', icon: ShieldCheckIcon },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
            >
              <Logo size="md" className="hidden sm:flex" />
              <Logo size="md" variant="icon-only" className="sm:hidden" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user?.email}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="h-6 w-px bg-border" />
                <ThemeToggle />
                
                {/* Settings Dropdown */}
                <div className="relative" ref={settingsMenuRef}>
                  <button
                    onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                    className="flex items-center space-x-1 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                    title="Settings"
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${settingsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {settingsMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {settingsMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                              onClick={() => setSettingsMenuOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => {
                            logout();
                            setSettingsMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full text-left transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary btn-lg"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="absolute left-0 right-0 top-16 bg-background border-t border-border shadow-xl">
              <div className="px-4 py-6 space-y-1">
                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                      onClick={closeMobileMenu}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Auth Section */}
                <div className="pt-4 mt-4 border-t border-border">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      {settingsMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                            onClick={closeMobileMenu}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        );
                      })}
                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="font-medium">Sign out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="flex items-center justify-center px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-base"
                        onClick={closeMobileMenu}
                      >
                        <UserCircleIcon className="h-5 w-5 mr-2" />
                        Sign in
                      </Link>
                      <Link
                        href="/auth/register"
                        className="btn-primary btn-lg w-full mt-2 flex items-center justify-center"
                        onClick={closeMobileMenu}
                      >
                        Get started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}