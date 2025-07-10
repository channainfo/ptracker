'use client';

import { useEffect, useState } from 'react';
import { 
  StarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
// import { Button } from '@/components/ui/button';

interface WatchedAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  isWatched: boolean;
}

export function WatchList() {
  const [watchedAssets, setWatchedAssets] = useState<WatchedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WatchedAsset[]>([]);

  // Mock asset data
  const allAssets: WatchedAsset[] = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67420.50,
      change24h: 1250.30,
      changePercent24h: 1.89,
      marketCap: 1324000000000,
      isWatched: true
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3420.75,
      change24h: -45.20,
      changePercent24h: -1.30,
      marketCap: 411000000000,
      isWatched: true
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      price: 145.82,
      change24h: 3.45,
      changePercent24h: 2.42,
      marketCap: 67800000000,
      isWatched: true
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.485,
      change24h: -0.012,
      changePercent24h: -2.41,
      marketCap: 17200000000,
      isWatched: false
    },
    {
      id: 'polygon',
      symbol: 'MATIC',
      name: 'Polygon',
      price: 0.89,
      change24h: 0.045,
      changePercent24h: 5.33,
      marketCap: 8900000000,
      isWatched: false
    },
    {
      id: 'chainlink',
      symbol: 'LINK',
      name: 'Chainlink',
      price: 14.25,
      change24h: -0.32,
      changePercent24h: -2.20,
      marketCap: 8400000000,
      isWatched: false
    }
  ];

  useEffect(() => {
    // Load watched assets
    setTimeout(() => {
      const watched = allAssets.filter(asset => asset.isWatched);
      setWatchedAssets(watched);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter search results
    if (searchTerm) {
      const filtered = allAssets.filter(asset => 
        !asset.isWatched && (
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleAddToWatchlist = (asset: WatchedAsset) => {
    const updatedAsset = { ...asset, isWatched: true };
    setWatchedAssets(prev => [...prev, updatedAsset]);
    setSearchTerm('');
    setShowAddModal(false);
  };

  const handleRemoveFromWatchlist = (assetId: string) => {
    setWatchedAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted rounded w-24"></div>
            <div className="h-6 w-6 bg-muted rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-muted rounded"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-12 mb-1"></div>
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
        <h3 className="text-lg font-semibold text-foreground">Watch List</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-outline btn-sm p-2"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Watched Assets */}
      <div className="space-y-3">
        {watchedAssets.length === 0 ? (
          <div className="text-center py-6">
            <StarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No assets in your watchlist</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-outline btn-sm mt-2"
            >
              <PlusIcon className="h-3 w-3 mr-1" />
              Add Asset
            </button>
          </div>
        ) : (
          watchedAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <StarIconSolid className="h-4 w-4 text-yellow-500" />
                  <button
                    onClick={() => handleRemoveFromWatchlist(asset.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {asset.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {asset.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(asset.price)}
                </p>
                <div className={`flex items-center justify-end space-x-1 text-xs ${
                  asset.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {asset.changePercent24h >= 0 ? (
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  )}
                  <span>{formatPercentage(asset.changePercent24h)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">Add to Watchlist</h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline btn-sm p-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchTerm ? (
                  searchResults.length > 0 ? (
                    searchResults.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => handleAddToWatchlist(asset)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {asset.symbol.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {asset.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {asset.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {formatCurrency(asset.price)}
                          </p>
                          <div className={`flex items-center justify-end space-x-1 text-xs ${
                            asset.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {asset.changePercent24h >= 0 ? (
                              <ArrowTrendingUpIcon className="h-3 w-3" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-3 w-3" />
                            )}
                            <span>{formatPercentage(asset.changePercent24h)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No assets found</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6">
                    <MagnifyingGlassIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Search for cryptocurrencies to add to your watchlist
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}