import { Metadata } from 'next';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import MarketSentiment from '@/components/dashboard/MarketSentiment';
import TrendingAssets from '@/components/dashboard/TrendingAssets';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your crypto portfolio dashboard with real-time insights and analytics.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's what's happening with your portfolio today.
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Portfolio Overview - Takes 2 columns on lg screens */}
            <div className="lg:col-span-2">
              <PortfolioOverview />
            </div>

            {/* Market Sentiment */}
            <div className="lg:col-span-1">
              <MarketSentiment />
            </div>

            {/* Trending Assets */}
            <div className="md:col-span-2 lg:col-span-3">
              <TrendingAssets />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}