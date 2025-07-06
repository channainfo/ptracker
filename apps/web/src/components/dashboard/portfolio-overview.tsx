'use client';

import { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
// import { Button } from '@/components/ui/button';

export function PortfolioOverview() {
  const { token } = useAuthStore();
  const { 
    portfolios, 
    isLoading, 
    fetchPortfolios,
    deletePortfolio
  } = usePortfolioStore();
  
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPortfolios(token);
    }
  }, [token, fetchPortfolios]);

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

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!token) return;
    
    if (confirm('Are you sure you want to delete this portfolio?')) {
      await deletePortfolio(portfolioId, token);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No portfolios yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Create your first portfolio to start tracking your crypto investments.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Portfolios</h2>
          <p className="text-muted-foreground">
            Manage and track your crypto investments
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Portfolio
        </button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => {
          const totalValue = portfolio.holdings?.reduce((sum, holding) => 
            sum + (holding.quantity * holding.averagePrice), 0) || 0;
          const holdingsCount = portfolio.holdings?.length || 0;
          
          // Mock performance data - replace with real calculation
          const mockPerformance = {
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 10
          };

          return (
            <div
              key={portfolio.id}
              className="card hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedPortfolio(portfolio.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {portfolio.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {portfolio.description || 'No description'}
                  </p>
                </div>
                
                <div className="relative">
                  <button className="p-1 hover:bg-accent rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Portfolio Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totalValue, portfolio.baseCurrency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Holdings</span>
                  <span className="text-sm text-foreground">
                    {holdingsCount} {holdingsCount === 1 ? 'asset' : 'assets'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <div className={`flex items-center space-x-1 text-sm ${
                    mockPerformance.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mockPerformance.change >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3" />
                    )}
                    <span>{formatPercentage(mockPerformance.changePercent)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="btn-outline btn-sm flex-1">
                  <EyeIcon className="h-3 w-3 mr-1" />
                  View
                </button>
                <button className="btn-outline btn-sm">
                  <PencilIcon className="h-3 w-3" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePortfolio(portfolio.id);
                  }}
                  className="btn-outline btn-sm text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>

              {/* Privacy Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  portfolio.isPublic 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {portfolio.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <CreatePortfolioModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

// Create Portfolio Modal Component (simplified)
function CreatePortfolioModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Portfolio</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Portfolio Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder="My Crypto Portfolio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="input w-full"
              rows={3}
              placeholder="Describe your investment strategy..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="public" className="checkbox" />
            <label htmlFor="public" className="text-sm">Make this portfolio public</label>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button className="btn-primary flex-1">
            Create Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}