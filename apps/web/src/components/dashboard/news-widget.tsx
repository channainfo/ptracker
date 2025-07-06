'use client';

import { useEffect, useState } from 'react';
import { 
  NewspaperIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'market' | 'technology' | 'regulation' | 'adoption' | 'general';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'market', label: 'Market' },
    { id: 'technology', label: 'Technology' },
    { id: 'regulation', label: 'Regulation' },
    { id: 'adoption', label: 'Adoption' }
  ];

  useEffect(() => {
    // Mock news data - replace with real API call
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Bitcoin Reaches New All-Time High Above $67,000',
        description: 'Bitcoin continues its bullish momentum as institutional adoption grows and ETF inflows remain strong.',
        url: '#',
        source: 'CryptoPulse',
        publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        category: 'market',
        sentiment: 'positive'
      },
      {
        id: '2',
        title: 'Ethereum 2.0 Staking Rewards See Significant Uptick',
        description: 'Recent protocol upgrades have led to improved staking yields, attracting more validators to the network.',
        url: '#',
        source: 'BlockchainToday',
        publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        category: 'technology',
        sentiment: 'positive'
      },
      {
        id: '3',
        title: 'SEC Announces New Clarity on Cryptocurrency Regulations',
        description: 'The Securities and Exchange Commission provides updated guidance on digital asset classification.',
        url: '#',
        source: 'RegTech News',
        publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        category: 'regulation',
        sentiment: 'neutral'
      },
      {
        id: '4',
        title: 'Major Retailer Announces Bitcoin Payment Integration',
        description: 'Leading e-commerce platform enables cryptocurrency payments for millions of customers worldwide.',
        url: '#',
        source: 'AdoptionWatch',
        publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        category: 'adoption',
        sentiment: 'positive'
      },
      {
        id: '5',
        title: 'DeFi Protocol Launches Revolutionary Yield Farming Features',
        description: 'New automated market maker introduces innovative liquidity mining mechanisms with enhanced security.',
        url: '#',
        source: 'DeFi Central',
        publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
        category: 'technology',
        sentiment: 'positive'
      },
      {
        id: '6',
        title: 'Crypto Market Volatility Increases Amid Economic Uncertainty',
        description: 'Digital assets experience heightened volatility as global economic indicators show mixed signals.',
        url: '#',
        source: 'Market Analytics',
        publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
        category: 'market',
        sentiment: 'negative'
      }
    ];

    setTimeout(() => {
      setNews(mockNews);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getCategoryBadge = (category: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (category) {
      case 'market':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'technology':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      case 'regulation':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'adoption':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`;
    }
  };

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-6 w-6 bg-muted rounded"></div>
          </div>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-muted rounded w-16"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 bg-muted rounded w-16"></div>
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
        <div className="flex items-center space-x-2">
          <NewspaperIcon className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Crypto News</h3>
        </div>
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredNews.length === 0 ? (
          <div className="text-center py-6">
            <NewspaperIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No news available</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <article
              key={item.id}
              className="group cursor-pointer hover:bg-accent p-3 rounded-md transition-colors border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={getCategoryBadge(item.category)}>
                    {item.category}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.sentiment === 'positive' ? 'bg-green-500' :
                    item.sentiment === 'negative' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                {item.title}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">{item.source}</span>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{formatTimeAgo(item.publishedAt)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredNews.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full flex items-center justify-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>View all news</span>
            <ChevronRightIcon className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}