'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { ChartPieIcon, EyeIcon } from '@heroicons/react/24/outline';

interface AssetAllocation {
  asset: string;
  assetName: string;
  value: number;
  percentage: number;
  quantity: number;
  color: string;
}

export function AssetAllocation() {
  const { token } = useAuthStore();
  const { portfolios, isLoading } = usePortfolioStore();
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (portfolios.length > 0) {
      // Calculate allocation from all portfolios
      const assetMap = new Map<string, { value: number; quantity: number; name: string }>();
      let total = 0;

      portfolios.forEach(portfolio => {
        portfolio.holdings?.forEach(holding => {
          const value = holding.quantity * holding.averagePrice;
          total += value;
          
          const existing = assetMap.get(holding.symbol) || { value: 0, quantity: 0, name: holding.name };
          assetMap.set(holding.symbol, {
            value: existing.value + value,
            quantity: existing.quantity + holding.quantity,
            name: existing.name
          });
        });
      });

      // Convert to allocations with colors
      const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#06B6D4', // cyan
        '#F97316', // orange
        '#84CC16', // lime
      ];

      const allocationData = Array.from(assetMap.entries())
        .map(([asset, data], index) => ({
          asset,
          assetName: data.name,
          value: data.value,
          quantity: data.quantity,
          percentage: total > 0 ? (data.value / total) * 100 : 0,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value);

      setAllocations(allocationData);
      setTotalValue(total);
    }
  }, [portfolios]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="h-4 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Asset Allocation</h3>
          <ChartPieIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center py-8">
          <ChartPieIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No assets to display</p>
          <p className="text-sm text-muted-foreground">Add some holdings to see your allocation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Asset Allocation</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(totalValue)}
          </span>
          <EyeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            
            {/* Asset segments */}
            {allocations.map((allocation, index) => {
              const circumference = 2 * Math.PI * 40;
              const strokeDasharray = `${(allocation.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -allocations
                .slice(0, index)
                .reduce((sum, prev) => sum + (prev.percentage / 100) * circumference, 0);

              return (
                <circle
                  key={allocation.asset}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={allocation.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-semibold text-foreground">
                {allocations.length} assets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        {allocations.map((allocation) => (
          <div
            key={allocation.asset}
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: allocation.color }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {allocation.asset}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(allocation.quantity)} {allocation.asset}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {allocation.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(allocation.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Portfolio Diversity</span>
          <span className="font-medium text-foreground">
            {allocations.length === 1 ? 'Single Asset' :
             allocations.length <= 3 ? 'Low Diversity' :
             allocations.length <= 6 ? 'Moderate Diversity' :
             'High Diversity'}
          </span>
        </div>
      </div>
    </div>
  );
}