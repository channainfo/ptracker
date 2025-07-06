'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface PerformanceData {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

type TimeRange = '1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL';

export function PerformanceChart() {
  const { token } = useAuthStore();
  const { portfolios, isLoading } = usePortfolioStore();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const [chartLoading, setChartLoading] = useState(true);

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '1D', value: '1D' },
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' }
  ];

  useEffect(() => {
    // Mock performance data generation
    const generateMockData = (range: TimeRange) => {
      const now = new Date();
      const dataPoints: PerformanceData[] = [];
      let days = 7;

      switch (range) {
        case '1D':
          days = 1;
          break;
        case '7D':
          days = 7;
          break;
        case '1M':
          days = 30;
          break;
        case '3M':
          days = 90;
          break;
        case '1Y':
          days = 365;
          break;
        case 'ALL':
          days = 730; // 2 years
          break;
      }

      let baseValue = 50000; // Starting portfolio value
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        
        // Simulate realistic crypto portfolio performance with volatility
        const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change max
        const trendChange = Math.sin(i / 10) * 0.02; // Long-term trend
        const changePercent = randomChange + trendChange;
        
        baseValue = baseValue * (1 + changePercent);
        const change = baseValue - (dataPoints[dataPoints.length - 1]?.value || baseValue);
        
        dataPoints.push({
          date: date.toISOString(),
          value: baseValue,
          change,
          changePercent: changePercent * 100
        });
      }

      return dataPoints;
    };

    setChartLoading(true);
    setTimeout(() => {
      const data = generateMockData(selectedRange);
      setPerformanceData(data);
      setChartLoading(false);
    }, 500);
  }, [selectedRange, portfolios]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const currentValue = performanceData[performanceData.length - 1]?.value || 0;
  const firstValue = performanceData[0]?.value || 0;
  const totalChange = currentValue - firstValue;
  const totalChangePercent = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;
  const isPositive = totalChange >= 0;

  // Calculate chart dimensions and path
  const chartWidth = 100;
  const chartHeight = 60;
  const minValue = Math.min(...performanceData.map(d => d.value));
  const maxValue = Math.max(...performanceData.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  const chartPath = performanceData
    .map((point, index) => {
      const x = (index / (performanceData.length - 1)) * chartWidth;
      const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  if (isLoading || chartLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted rounded w-40"></div>
            <div className="h-8 bg-muted rounded w-32"></div>
          </div>
          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
          <div className="h-8 bg-muted rounded w-32 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Performance</h3>
        <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedRange === range.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Value and Change */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Current Value</p>
        <div className="flex items-center space-x-3">
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(currentValue)}
          </p>
          <div className={`flex items-center space-x-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {formatCurrency(Math.abs(totalChange))} ({formatPercentage(totalChangePercent)})
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedRange} performance
        </p>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="h-32 mb-4">
          {performanceData.length > 0 ? (
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted/20"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Area under curve */}
              <path
                d={`${chartPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                fill="currentColor"
                className={`${isPositive ? 'text-green-500' : 'text-red-500'} opacity-10`}
              />
              
              {/* Main line */}
              <path
                d={chartPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={isPositive ? 'text-green-500' : 'text-red-500'}
              />
              
              {/* Data points */}
              {performanceData.map((point, index) => {
                const x = (index / (performanceData.length - 1)) * chartWidth;
                const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="currentColor"
                    className={isPositive ? 'text-green-500' : 'text-red-500'}
                  />
                );
              })}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No performance data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Labels */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {performanceData.length > 0 && 
              new Date(performanceData[0].date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
            }
          </span>
          <span className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {performanceData.length > 0 && 
                new Date(performanceData[performanceData.length - 1].date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })
              }
            </span>
          </span>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(maxValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(minValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Volatility</p>
            <p className="text-sm font-medium text-foreground">
              {((valueRange / ((maxValue + minValue) / 2)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}