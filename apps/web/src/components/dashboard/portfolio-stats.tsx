'use client';

import { useEffect } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function PortfolioStats() {
  const { token } = useAuthStore();
  const { 
    portfolios, 
    portfolioSummary, 
    isLoading, 
    fetchPortfolios,
    fetchPortfolioSummary 
  } = usePortfolioStore();

  useEffect(() => {
    if (token) {
      fetchPortfolios(token);
    }
  }, [token, fetchPortfolios]);

  useEffect(() => {
    if (token && portfolios.length > 0) {
      // Fetch summary for the first portfolio or all portfolios
      fetchPortfolioSummary(portfolios[0].id, token);
    }
  }, [token, portfolios, fetchPortfolioSummary]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  // Calculate total portfolio value across all portfolios
  const totalPortfolioValue = portfolios.reduce((total, portfolio) => {
    return total + (portfolio.holdings?.reduce((sum, holding) => 
      sum + (holding.quantity * holding.averagePrice), 0) || 0);
  }, 0);

  // Mock data for demonstration - replace with real calculations
  const mockStats = {
    totalInvested: totalPortfolioValue * 0.85, // Assuming 15% profit
    totalProfit: totalPortfolioValue * 0.15,
    profitPercentage: 17.65,
    dayChange: totalPortfolioValue * 0.032,
    dayChangePercentage: 3.2,
    totalAssets: portfolios.reduce((total, portfolio) => 
      total + (portfolio.holdings?.length || 0), 0),
    activePortfolios: portfolios.length
  };

  const stats = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(totalPortfolioValue),
      change: formatCurrency(mockStats.dayChange),
      changePercent: mockStats.dayChangePercentage,
      icon: WalletIcon,
      color: 'blue'
    },
    {
      label: 'Total Invested',
      value: formatCurrency(mockStats.totalInvested),
      change: null,
      changePercent: null,
      icon: CurrencyDollarIcon,
      color: 'gray'
    },
    {
      label: 'Total Profit/Loss',
      value: formatCurrency(mockStats.totalProfit),
      change: formatPercentage(mockStats.profitPercentage),
      changePercent: mockStats.profitPercentage,
      icon: ArrowTrendingUpIcon,
      color: mockStats.profitPercentage >= 0 ? 'green' : 'red'
    },
    {
      label: 'Active Assets',
      value: mockStats.totalAssets.toString(),
      change: `${mockStats.activePortfolios} ${mockStats.activePortfolios === 1 ? 'portfolio' : 'portfolios'}`,
      changePercent: null,
      icon: ChartBarIcon,
      color: 'purple'
    }
  ];

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Portfolio Overview</h2>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <ClockIcon className="h-3 w-3" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.changePercent !== null ? stat.changePercent >= 0 : null;
          
          return (
            <div key={index} className="relative">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  {stat.change && (
                    <div className={`flex items-center space-x-1 text-sm mt-1 ${
                      isPositive === null ? 'text-muted-foreground' :
                      isPositive ? 'text-green-600 dark:text-green-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {isPositive !== null && (
                        <>
                          {isPositive ? (
                            <ArrowTrendingUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-3 w-3" />
                          )}
                        </>
                      )}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Portfolio Performance</span>
          <div className={`flex items-center space-x-1 ${
            mockStats.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {mockStats.profitPercentage >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="font-medium">
              {formatPercentage(mockStats.profitPercentage)} All Time
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}