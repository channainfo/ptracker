'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // Only redirect to dashboard if user's email is verified or they don't have an email (social login)
      const shouldRedirect = !user?.email || user?.emailVerified;
      if (shouldRedirect) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow authenticated users with unverified emails to stay on auth pages (like email verification)
  if (isAuthenticated && user?.email && !user?.emailVerified) {
    // Allow access to auth pages for email verification
  } else if (isAuthenticated) {
    return null; // Will redirect to dashboard for verified users
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background relative">
        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Logo size="md" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Hero/Marketing */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md text-center">
              {/* Logo for branding */}
              <div className="mb-8 flex justify-center">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                  <Logo size="lg" variant="icon-only" className="text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Track Your Crypto Portfolio
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Monitor your cryptocurrency investments, analyze market trends, and make informed decisions with our comprehensive tracking platform.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="font-semibold">Real-time Tracking</div>
                  <div className="opacity-80">Live price updates</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="font-semibold">Portfolio Analytics</div>
                  <div className="opacity-80">Detailed insights</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="font-semibold">Security First</div>
                  <div className="opacity-80">Bank-level security</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="font-semibold">Multi-Exchange</div>
                  <div className="opacity-80">Connect all accounts</div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-20 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}