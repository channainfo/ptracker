'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  NewspaperIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  image?: string;
  coins: string[];
}

export function NewsStreamWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newNewsCount, setNewNewsCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initialNews: NewsItem[] = [
    {
      id: '1',
      title: 'Bitcoin ETF Sees Record $2.1B Inflow This Week',
      summary: 'Institutional adoption continues as BlackRock\'s Bitcoin ETF experiences unprecedented demand...',
      source: 'CoinDesk',
      time: '2 minutes ago',
      sentiment: 'positive',
      impact: 'high',
      coins: ['BTC']
    },
    {
      id: '2',
      title: 'Ethereum Upgrade Reduces Transaction Fees by 40%',
      summary: 'Latest network optimization brings significant cost savings for DeFi users...',
      source: 'CryptoNews',
      time: '15 minutes ago',
      sentiment: 'positive',
      impact: 'high',
      coins: ['ETH']
    },
    {
      id: '3',
      title: 'SEC Announces New Crypto Regulatory Framework',
      summary: 'Clearer guidelines expected to reduce market uncertainty and boost institutional confidence...',
      source: 'Reuters',
      time: '1 hour ago',
      sentiment: 'neutral',
      impact: 'high',
      coins: ['BTC', 'ETH', 'ADA']
    },
    {
      id: '4',
      title: 'Major DeFi Protocol Launches Cross-Chain Bridge',
      summary: 'New interoperability solution enables seamless asset transfers across multiple blockchains...',
      source: 'DeFi Pulse',
      time: '2 hours ago',
      sentiment: 'positive',
      impact: 'medium',
      coins: ['LINK', 'UNI']
    },
    {
      id: '5',
      title: 'Whale Moves $500M in Bitcoin Off Exchanges',
      summary: 'Large-scale withdrawal suggests long-term holding strategy amid current market conditions...',
      source: 'Whale Alert',
      time: '3 hours ago',
      sentiment: 'positive',
      impact: 'medium',
      coins: ['BTC']
    }
  ];

  const additionalNewsPool: NewsItem[] = [
    {
      id: '6',
      title: 'Solana Network Processes Record 65M Transactions',
      summary: 'New milestone achieved as Solana demonstrates scalability with unprecedented transaction throughput...',
      source: 'Solana Labs',
      time: 'Just now',
      sentiment: 'positive',
      impact: 'high',
      coins: ['SOL']
    },
    {
      id: '7',
      title: 'Cardano Smart Contract Activity Surges 300%',
      summary: 'ADA ecosystem sees massive growth in DeFi applications and NFT marketplace activity...',
      source: 'Cardano Foundation',
      time: 'Just now',
      sentiment: 'positive',
      impact: 'medium',
      coins: ['ADA']
    },
    {
      id: '8',
      title: 'Polygon Announces Zero-Knowledge EVM Integration',
      summary: 'Revolutionary zkEVM technology promises to enhance privacy and scalability for Ethereum Layer 2...',
      source: 'Polygon Team',
      time: 'Just now',
      sentiment: 'positive',
      impact: 'high',
      coins: ['MATIC']
    },
    {
      id: '9',
      title: 'Chainlink Oracles Secure $100B in Total Value',
      summary: 'Decentralized oracle network reaches new milestone in securing DeFi protocols across multiple chains...',
      source: 'Chainlink Labs',
      time: 'Just now',
      sentiment: 'positive',
      impact: 'medium',
      coins: ['LINK']
    },
    {
      id: '10',
      title: 'Binance Coin Burns 2.1M BNB Tokens',
      summary: 'Quarterly token burn reduces total supply, potentially impacting token economics and price dynamics...',
      source: 'Binance',
      time: 'Just now',
      sentiment: 'positive',
      impact: 'medium',
      coins: ['BNB']
    },
    {
      id: '11',
      title: 'Avalanche Subnet Deployment Hits All-Time High',
      summary: 'Enterprise adoption accelerates with record number of custom blockchain deployments...',
      source: 'Ava Labs',
      time: 'Just now',
      sentiment: 'positive',
      impact: 'medium',
      coins: ['AVAX']
    }
  ];

  // Initialize news on component mount
  useEffect(() => {
    setNews(initialNews);
  }, []);

  // Simulate new news streaming in
  useEffect(() => {
    const streamingInterval = setInterval(() => {
      if (additionalNewsPool.length > 0) {
        setIsStreaming(true);
        setNewNewsCount(prev => prev + 1);
        
        // Add a random news item from the pool
        const randomIndex = Math.floor(Math.random() * additionalNewsPool.length);
        const newItem = {
          ...additionalNewsPool[randomIndex],
          id: `${additionalNewsPool[randomIndex].id}-${Date.now()}`,
          time: 'Just now'
        };
        
        setTimeout(() => {
          setNews(prevNews => [newItem, ...prevNews.slice(0, 4)]); // Keep only 5 items
          setIsStreaming(false);
        }, 1500); // Delay to show streaming effect
      }
    }, 8000); // New news every 8 seconds

    return () => clearInterval(streamingInterval);
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ArrowUpIcon className="h-4 w-4 text-green-400" />;
      case 'negative':
        return <ArrowDownIcon className="h-4 w-4 text-red-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <NewspaperIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Live News Feed</h3>
            <p className="text-sm text-muted-foreground">Real-time crypto market updates</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Streaming Indicator */}
      {(isStreaming || newNewsCount > 0) && (
        <div className="mb-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-blue-900/30 text-blue-400 px-3 py-2 rounded-full text-sm animate-pulse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{isStreaming ? 'New updates streaming...' : `${newNewsCount} new update${newNewsCount > 1 ? 's' : ''}`}</span>
          </div>
        </div>
      )}

      {/* News Items */}
      <div className="space-y-4 max-h-64 sm:max-h-80 overflow-y-auto scrollbar-hide">
        {news.map((newsItem, index) => (
          <div 
            key={newsItem.id}
            className={`group relative p-4 rounded-lg border border-border hover:border-accent-foreground/20 transition-all duration-200 hover:shadow-md cursor-pointer ${
              index === 0 && newsItem.time === 'Just now' 
                ? 'animate-slide-in-top border-blue-500/50 bg-blue-900/10' 
                : 'animate-fade-in'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Impact Badge */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                getImpactColor(newsItem.impact)
              } ${
                index === 0 && newsItem.time === 'Just now' ? 'animate-pulse' : ''
              }`}>
                {newsItem.impact.toUpperCase()}
              </span>
              {index === 0 && newsItem.time === 'Just now' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
              )}
            </div>

            {/* News Content */}
            <div className="pr-16">
              <div className="flex items-start space-x-3">
                <div className={index === 0 && newsItem.time === 'Just now' ? 'animate-pulse' : ''}>
                  {getSentimentIcon(newsItem.sentiment)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors ${
                    index === 0 && newsItem.time === 'Just now' ? 'text-blue-400' : ''
                  }`}>
                    {newsItem.title}
                    {index === 0 && newsItem.time === 'Just now' && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {newsItem.summary}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <GlobeAltIcon className="h-3 w-3" />
                        <span>{newsItem.source}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <ClockIcon className="h-3 w-3" />
                        <span className={index === 0 && newsItem.time === 'Just now' ? 'text-blue-400 font-medium' : ''}>
                          {newsItem.time}
                        </span>
                      </div>
                    </div>
                    
                    {/* Affected Coins */}
                    <div className="flex items-center space-x-1">
                      {newsItem.coins.slice(0, 3).map((coin) => (
                        <span key={coin} className={`px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full ${
                          index === 0 && newsItem.time === 'Just now' ? 'bg-blue-500 text-white animate-pulse' : ''
                        }`}>
                          {coin}
                        </span>
                      ))}
                      {newsItem.coins.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{newsItem.coins.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Action */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground">
              Last updated: {currentTime.toLocaleTimeString()}
            </div>
            {isStreaming && (
              <div className="flex items-center space-x-1 text-xs text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted-foreground">
              {news.length} articles
            </span>
            <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              View All News →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}