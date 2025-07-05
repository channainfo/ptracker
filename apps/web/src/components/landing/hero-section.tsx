import Link from 'next/link';
import { PlayIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { HeroLiveWidget } from './widgets/hero-live-widget';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-900/50 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-500/30">
              <ChartBarIcon className="h-4 w-4" />
              <span>Trusted by 50,000+ investors</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-5xl xl:text-6xl">
              Master Crypto 
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Investing
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="mt-6 text-lg leading-7 text-gray-300">
              Real-time market insights, portfolio tracking, and AI-powered analysis - all in one platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <Link
                href="/auth/register"
                className="group relative inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
              >
                <span className="mr-2">Start Free Trial</span>
                <ChartBarIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/demo" 
                className="group inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-medium text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                <span>Watch Demo</span>
              </Link>
            </div>
            
            {/* Value Props */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full" />
                <span>500+ Coins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-400 rounded-full" />
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                <span>AI Insights</span>
              </div>
            </div>
            
            {/* Learning CTA */}
            <div className="mt-6">
              <Link 
                href="/learn" 
                className="group inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
              >
                <AcademicCapIcon className="h-4 w-4" />
                <span>New to crypto? Start here</span>
                <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Live Widget */}
          <div className="relative">
            <HeroLiveWidget />
            
            {/* Floating Badge */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              🔴 LIVE
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-20 mx-auto max-w-4xl">
          <div className="text-center text-sm text-gray-400 mb-6">
            Trusted by investors worldwide
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center opacity-60">
            <div className="flex items-center justify-center">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">50K+</div>
                <div className="text-xs text-gray-400">Users</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">$2B+</div>
                <div className="text-xs text-gray-400">Tracked</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">500+</div>
                <div className="text-xs text-gray-400">Coins</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">24/7</div>
                <div className="text-xs text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}