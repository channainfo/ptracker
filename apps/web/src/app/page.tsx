'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { StatsSection } from '@/components/landing/stats-section';
import { WidgetsShowcaseSection } from '@/components/landing/widgets-showcase-section';
import { EducationSection } from '@/components/landing/education-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTASection } from '@/components/landing/cta-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthenticatedLanding } from '@/components/landing/authenticated-landing';

export default function HomePage() {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Different content for authenticated vs non-authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <AuthenticatedLanding />
        </main>
        <Footer />
      </div>
    );
  }

  // Marketing landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <WidgetsShowcaseSection />
        <EducationSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}