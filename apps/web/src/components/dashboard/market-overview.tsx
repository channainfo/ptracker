'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    marketCapChange: 0,
    totalVolume: 0,
    btcDominance: 0
  });

  useEffect(() => {
    // Mock data - replace with real API call
    const mockData: MarketData[] = [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 67420.50,
        change24h: 1250.30,
        changePercent24h: 1.89,
        marketCap: 1324000000000,
        volume24h: 28500000000
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3420.75,
        change24h: -45.20,
        changePercent24h: -1.30,
        marketCap: 411000000000,
        volume24h: 15200000000
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        price: 145.82,
        change24h: 3.45,
        changePercent24h: 2.42,
        marketCap: 67800000000,
        volume24h: 2100000000
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        price: 0.485,
        change24h: -0.012,
        changePercent24h: -2.41,
        marketCap: 17200000000,
        volume24h: 420000000
      }
    ];

    const mockStats = {
      totalMarketCap: 2400000000000,
      marketCapChange: 2.1,
      totalVolume: 82000000000,
      btcDominance: 55.2
    };

    setTimeout(() => {
      setMarketData(mockData);
      setMarketStats(mockStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e12) {
      return `$${(amount / 1e12).toFixed(2)}T`;
    } else if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(2)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Market Overview</h3>
        <GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground">Market Cap</p>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(marketStats.totalMarketCap)}
          </p>
          <p className={`text-xs ${
            marketStats.marketCapChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(marketStats.marketCapChange)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">24h Volume</p>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(marketStats.totalVolume)}
          </p>
          <p className="text-xs text-muted-foreground">
            BTC Dom: {marketStats.btcDominance}%
          </p>
        </div>
      </div>

      {/* Top Cryptocurrencies */}
      <div className="space-y-3">
        {marketData.map((crypto) => (
          <div
            key={crypto.id}
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {crypto.symbol.substring(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {crypto.symbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  {crypto.name}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(crypto.price)}
              </p>
              <div className={`flex items-center justify-end space-x-1 text-xs ${
                crypto.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {crypto.changePercent24h >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                <span>{formatPercentage(crypto.changePercent24h)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Live data</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}