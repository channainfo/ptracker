'use client';

import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  FaceSmileIcon,
  FaceFrownIcon,
  FireIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SentimentData {
  label: string;
  value: number;
  change: number;
  color: string;
  icon: any;
}

interface MarketMood {
  overall: number;
  fearGreed: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export function MarketSentimentWidget() {
  const [currentMood, setCurrentMood] = useState<MarketMood>({
    overall: 74,
    fearGreed: 68,
    trend: 'bullish',
    confidence: 82
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateType, setLastUpdateType] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [updateCount, setUpdateCount] = useState(0);
  const [sentimentMetrics, setSentimentMetrics] = useState<SentimentData[]>([
    {
      label: 'Social Sentiment',
      value: 76,
      change: +5.2,
      color: 'text-green-400',
      icon: HeartIcon
    },
    {
      label: 'News Sentiment',
      value: 68,
      change: +2.1,
      color: 'text-blue-400',
      icon: EyeIcon
    },
    {
      label: 'Whale Activity',
      value: 82,
      change: +8.7,
      color: 'text-purple-400',
      icon: ArrowTrendingUpIcon
    },
    {
      label: 'Dev Activity',
      value: 71,
      change: -1.4,
      color: 'text-orange-400',
      icon: FireIcon
    }
  ]);
  const [marketSignals, setMarketSignals] = useState({
    buy: ['BTC', 'ETH'],
    hold: ['ADA', 'SOL']
  });

  // Simulate real-time updates with streaming effects
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setUpdateCount(prev => prev + 1);
      
      setTimeout(() => {
        const overallChange = (Math.random() - 0.5) * 6;
        const fearGreedChange = (Math.random() - 0.5) * 8;
        
        // Determine update type based on changes
        const updateType = overallChange > 2 ? 'positive' : overallChange < -2 ? 'negative' : 'neutral';
        setLastUpdateType(updateType);
        
        setCurrentMood(prev => ({
          overall: Math.max(0, Math.min(100, prev.overall + overallChange)),
          fearGreed: Math.max(0, Math.min(100, prev.fearGreed + fearGreedChange)),
          trend: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'bullish' : 'bearish') : prev.trend,
          confidence: Math.max(0, Math.min(100, prev.confidence + (Math.random() - 0.5) * 4))
        }));
        
        // Update sentiment metrics
        setSentimentMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 8)),
          change: (Math.random() - 0.5) * 10
        })));
        
        // Occasionally update market signals
        if (Math.random() > 0.7) {
          const cryptos = ['BTC', 'ETH', 'ADA', 'SOL', 'MATIC', 'LINK', 'DOT', 'AVAX'];
          const shuffled = cryptos.sort(() => Math.random() - 0.5);
          setMarketSignals({
            buy: shuffled.slice(0, 2),
            hold: shuffled.slice(2, 4)
          });
        }
        
        setIsUpdating(false);
      }, 1200); // Delay to show updating effect
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, []);


  const getMoodEmoji = (score: number) => {
    if (score >= 80) return '🚀';
    if (score >= 70) return '😊';
    if (score >= 50) return '😐';
    if (score >= 30) return '😟';
    return '😨';
  };

  const getMoodLabel = (score: number) => {
    if (score >= 80) return 'Extremely Bullish';
    if (score >= 70) return 'Bullish';
    if (score >= 50) return 'Neutral';
    if (score >= 30) return 'Bearish';
    return 'Extremely Bearish';
  };

  const getFearGreedLabel = (score: number) => {
    if (score >= 75) return 'Extreme Greed';
    if (score >= 55) return 'Greed';
    if (score >= 45) return 'Neutral';
    if (score >= 25) return 'Fear';
    return 'Extreme Fear';
  };

  const getGradientColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-purple-500/20 rounded-lg transition-all duration-300 ${
            isUpdating ? 'animate-pulse bg-purple-500/40' : ''
          }`}>
            <ChartBarIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Market Sentiment</h3>
            <p className="text-sm text-muted-foreground flex items-center space-x-2">
              <span>AI-powered market analysis</span>
              {isUpdating && (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-2xl transition-all duration-500 ${
            isUpdating ? 'animate-pulse scale-110' : ''
          }`}>
            {getMoodEmoji(currentMood.overall)}
          </div>
          {lastUpdateType !== 'neutral' && (
            <div className={`w-3 h-3 rounded-full animate-ping ${
              lastUpdateType === 'positive' ? 'bg-green-400' : 'bg-red-400'
            }`} />
          )}
        </div>
      </div>

      {/* Update Notification */}
      {(isUpdating || updateCount > 0) && (
        <div className="mb-4 flex items-center justify-center">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm transition-all duration-300 ${
            isUpdating 
              ? 'bg-purple-900/30 text-purple-400 animate-pulse' 
              : lastUpdateType === 'positive'
                ? 'bg-green-900/30 text-green-400'
                : lastUpdateType === 'negative'
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-blue-900/30 text-blue-400'
          }`}>
            {isUpdating ? (
              <>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Analyzing market sentiment...</span>
              </>
            ) : (
              <>
                <div className={`w-2 h-2 rounded-full ${
                  lastUpdateType === 'positive' ? 'bg-green-400' : 
                  lastUpdateType === 'negative' ? 'bg-red-400' : 'bg-blue-400'
                }`} />
                <span>
                  {lastUpdateType === 'positive' ? '📈 Sentiment improving' :
                   lastUpdateType === 'negative' ? '📉 Sentiment declining' :
                   '📊 Sentiment updated'} • {updateCount} update{updateCount > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className="max-h-64 sm:max-h-80 overflow-y-auto scrollbar-hide">
        {/* Overall Sentiment Score */}
        <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Sentiment</span>
          <span className="text-2xl font-bold text-foreground">{Math.round(currentMood.overall)}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 mb-2 relative overflow-hidden">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${getGradientColor(currentMood.overall)} transition-all duration-1000 relative ${
              isUpdating ? 'animate-pulse' : ''
            }`}
            style={{ width: `${currentMood.overall}%` }}
          >
            <div className="absolute right-0 top-0 h-3 w-1 bg-white/30 rounded-full animate-pulse" />
            {isUpdating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Bearish</span>
          <span className="font-medium text-foreground">{getMoodLabel(currentMood.overall)}</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Fear & Greed Index */}
      <div className="mb-6 p-4 bg-accent/50 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="text-lg">{currentMood.fearGreed >= 50 ? '🤑' : '😱'}</div>
            <span className="text-sm font-medium text-foreground">Fear & Greed Index</span>
          </div>
          <span className="text-xl font-bold text-foreground">{Math.round(currentMood.fearGreed)}</span>
        </div>
        <div className="relative">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000 relative ${
                isUpdating ? 'animate-pulse' : ''
              }`}
              style={{ width: `${currentMood.fearGreed}%` }}
            >
              {isUpdating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs font-medium text-foreground">{getFearGreedLabel(currentMood.fearGreed)}</span>
          </div>
        </div>
      </div>

      {/* Sentiment Metrics */}
      <div className="space-y-4 mb-6">
        {sentimentMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const wasRecentlyUpdated = isUpdating || (updateCount > 0 && Math.random() > 0.5);
          return (
            <div 
              key={metric.label} 
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
                wasRecentlyUpdated 
                  ? 'bg-accent/50 border border-purple-500/30 animate-pulse' 
                  : 'bg-accent/30 hover:bg-accent/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${metric.color} transition-all duration-300 ${
                  wasRecentlyUpdated ? 'animate-pulse scale-110' : ''
                }`} />
                <span className="text-sm font-medium text-foreground">{metric.label}</span>
                {wasRecentlyUpdated && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold text-foreground transition-all duration-300 ${
                  wasRecentlyUpdated ? 'text-purple-400' : ''
                }`}>
                  {Math.round(metric.value)}%
                </span>
                <div className={`flex items-center space-x-1 text-xs transition-all duration-300 ${
                  metric.change >= 0 ? 'text-green-400' : 'text-red-400'
                } ${wasRecentlyUpdated ? 'animate-pulse' : ''}`}>
                  {metric.change >= 0 ? (
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  )}
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Signals */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Live Market Signals</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className={`text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30 transition-all duration-500 ${
            isUpdating ? 'animate-pulse border-green-400' : ''
          }`}>
            <div className={`text-lg transition-transform duration-300 ${
              isUpdating ? 'scale-110 animate-bounce' : ''
            }`}>📈</div>
            <div className="text-xs text-green-400 font-medium">Buy Signal</div>
            <div className={`text-xs text-muted-foreground transition-colors duration-300 ${
              isUpdating ? 'text-green-300' : ''
            }`}>
              {marketSignals.buy.join(', ')}
            </div>
            {isUpdating && (
              <div className="mt-1 w-full h-1 bg-green-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full animate-shimmer" style={{ width: '60%' }} />
              </div>
            )}
          </div>
          <div className={`text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 transition-all duration-500 ${
            isUpdating ? 'animate-pulse border-blue-400' : ''
          }`}>
            <div className={`text-lg transition-transform duration-300 ${
              isUpdating ? 'scale-110 animate-bounce' : ''
            }`}>⏳</div>
            <div className="text-xs text-blue-400 font-medium">Hold Signal</div>
            <div className={`text-xs text-muted-foreground transition-colors duration-300 ${
              isUpdating ? 'text-blue-300' : ''
            }`}>
              {marketSignals.hold.join(', ')}
            </div>
            {isUpdating && (
              <div className="mt-1 w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full animate-shimmer" style={{ width: '40%' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${
              isUpdating 
                ? 'bg-purple-400 animate-ping' 
                : 'bg-primary animate-pulse'
            }`} />
            <span className="text-xs text-muted-foreground">AI Confidence</span>
            {isUpdating && (
              <span className="text-xs text-purple-400 animate-pulse">Updating...</span>
            )}
          </div>
          <span className={`text-xs font-medium transition-colors duration-300 ${
            isUpdating ? 'text-purple-400' : 'text-foreground'
          }`}>
            {Math.round(currentMood.confidence)}%
          </span>
        </div>
      </div>
      </div> {/* Close scrollable container */}
    </div>
  );
}