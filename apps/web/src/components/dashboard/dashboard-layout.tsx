'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { PortfolioOverview } from './portfolio-overview';
import { PortfolioStats } from './portfolio-stats';
import { RecentTransactions } from './recent-transactions';
import { MarketOverview } from './market-overview';
import { QuickActions } from './quick-actions';
import { AssetAllocation } from './asset-allocation';
import { PerformanceChart } from './performance-chart';
import { WatchList } from './watch-list';
import { NewsWidget } from './news-widget';
import { 
  ChartBarIcon,
  WalletIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface DashboardTab {
  id: string;
  name: string;
  icon: any;
}

const dashboardTabs: DashboardTab[] = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
  { id: 'portfolio', name: 'Portfolio', icon: WalletIcon },
  { id: 'transactions', name: 'Transactions', icon: ClockIcon },
  { id: 'analytics', name: 'Analytics', icon: ArrowTrendingUpIcon },
];

export function DashboardLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const name = user?.firstName || 'there';
    return `Good ${timeOfDay}, ${name}!`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'portfolio':
        return <PortfolioTab />;
      case 'transactions':
        return <TransactionsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {getGreeting()}
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your investments today.
              </p>
            </div>
            <QuickActions />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-muted/50 rounded-lg p-1">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Portfolio Stats */}
      <div className="lg:col-span-2">
        <PortfolioStats />
      </div>
      
      {/* Quick Market Overview */}
      <div className="lg:col-span-1">
        <MarketOverview />
      </div>

      {/* Performance Chart */}
      <div className="md:col-span-2">
        <PerformanceChart />
      </div>

      {/* Asset Allocation */}
      <div className="md:col-span-1">
        <AssetAllocation />
      </div>

      {/* Recent Activity */}
      <div className="md:col-span-2 lg:col-span-2">
        <RecentTransactions limit={5} />
      </div>

      {/* Watch List */}
      <div className="md:col-span-1">
        <WatchList />
      </div>

      {/* News Widget */}
      <div className="md:col-span-2 lg:col-span-3">
        <NewsWidget />
      </div>
    </div>
  );
}

function PortfolioTab() {
  return (
    <div className="space-y-6">
      <PortfolioOverview />
    </div>
  );
}

function TransactionsTab() {
  return (
    <div className="space-y-6">
      <RecentTransactions />
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <PerformanceChart />
      </div>
      <AssetAllocation />
      <div className="space-y-4">
        <PortfolioStats />
      </div>
    </div>
  );
}