'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  PlusIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const PortfolioOverview: React.FC = () => {
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
      // Fetch summary for the first portfolio
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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No portfolios
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first portfolio.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-bitcoin-500 hover:bg-bitcoin-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = portfolioSummary || {
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0,
    holdingsCount: 0,
  };

  const isProfit = summary.profitLoss >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Portfolio Overview
        </h2>
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin-500">
          <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
          Add Holding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Value */}
        <div className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-bitcoin-100 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</p>
            </div>
          </div>
        </div>

        {/* Total Invested */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.totalInvested)}
              </p>
            </div>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Profit/Loss
              </p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${
                  isProfit ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(summary.profitLoss))}
                </p>
                {isProfit ? (
                  <TrendingUpIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDownIcon className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className={`text-sm ${
                isProfit ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(summary.profitLossPercentage)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Your Portfolios ({portfolios.length})
        </h3>
        <div className="space-y-3">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {portfolio.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {portfolio.holdings?.length || 0} holdings • {portfolio.baseCurrency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(portfolio.totalValue, portfolio.baseCurrency)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {portfolio.isPublic ? 'Public' : 'Private'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;