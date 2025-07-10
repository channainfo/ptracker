'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
// import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  asset: string;
  assetName: string;
  amount: number;
  price: number;
  total: number;
  currency: string;
  timestamp: string;
  portfolioName: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit }: RecentTransactionsProps) {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'TRANSFER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - replace with real API call
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'BUY',
        asset: 'BTC',
        assetName: 'Bitcoin',
        amount: 0.5,
        price: 67420.50,
        total: 33710.25,
        currency: 'USD',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        portfolioName: 'Main Portfolio',
        status: 'COMPLETED'
      },
      {
        id: '2',
        type: 'SELL',
        asset: 'ETH',
        assetName: 'Ethereum',
        amount: 2.0,
        price: 3420.75,
        total: 6841.50,
        currency: 'USD',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        portfolioName: 'Trading Portfolio',
        status: 'COMPLETED'
      },
      {
        id: '3',
        type: 'BUY',
        asset: 'SOL',
        assetName: 'Solana',
        amount: 10.0,
        price: 145.82,
        total: 1458.20,
        currency: 'USD',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        portfolioName: 'Main Portfolio',
        status: 'PENDING'
      },
      {
        id: '4',
        type: 'TRANSFER',
        asset: 'ADA',
        assetName: 'Cardano',
        amount: 1000.0,
        price: 0.485,
        total: 485.00,
        currency: 'USD',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        portfolioName: 'Long Term',
        status: 'COMPLETED'
      },
      {
        id: '5',
        type: 'SELL',
        asset: 'BTC',
        assetName: 'Bitcoin',
        amount: 0.1,
        price: 66800.00,
        total: 6680.00,
        currency: 'USD',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        portfolioName: 'Trading Portfolio',
        status: 'FAILED'
      },
      {
        id: '6',
        type: 'BUY',
        asset: 'ETH',
        assetName: 'Ethereum',
        amount: 1.5,
        price: 3350.00,
        total: 5025.00,
        currency: 'USD',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        portfolioName: 'Main Portfolio',
        status: 'COMPLETED'
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, [token]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredTransactions = transactions
    .filter(tx => filter === 'ALL' || tx.type === filter)
    .filter(tx => 
      searchTerm === '' || 
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.portfolioName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, limit);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case 'SELL':
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      case 'TRANSFER':
        return <ArrowUpIcon className="h-4 w-4 text-blue-600 rotate-45" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`;
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
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
        <h3 className="text-lg font-semibold text-foreground">
          Recent Transactions
          {limit && <span className="text-sm text-muted-foreground ml-2">({filteredTransactions.length})</span>}
        </h3>
        {!limit && (
          <div className="flex items-center space-x-2">
            <button className="btn-outline btn-sm">
              <EyeIcon className="h-4 w-4 mr-1" />
              View All
            </button>
          </div>
        )}
      </div>

      {/* Filters - only show if not limited */}
      {!limit && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-1">
            <FunnelIcon className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input text-sm"
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors cursor-pointer border border-border/50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-foreground">
                      {transaction.type} {transaction.asset}
                    </p>
                    <span className={getStatusBadge(transaction.status)}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transaction.portfolioName} • {formatTimeAgo(transaction.timestamp)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {formatAmount(transaction.amount)} {transaction.asset}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(transaction.total)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {limit && filteredTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="btn-outline w-full">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
}