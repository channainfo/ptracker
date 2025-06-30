'use client';

import React from 'react';
import { 
  FaceSmileIcon,
  FaceFrownIcon,
  MinusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SentimentData {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number; // 0-100
  signals: {
    social: number;
    news: number;
    onChain: number;
    technical: number;
  };
  fearGreedIndex: number;
  volume24h: number;
  marketCap: number;
}

const MarketSentiment: React.FC = () => {
  // Mock data - in real app this would come from sentiment analysis API
  const sentimentData: SentimentData = {
    overall: 'bullish',
    score: 72,
    signals: {
      social: 68,
      news: 75,
      onChain: 70,
      technical: 76,
    },
    fearGreedIndex: 65,
    volume24h: 45600000000,
    marketCap: 1200000000000,
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <FaceSmileIcon className="h-6 w-6 text-green-600" />;
      case 'bearish':
        return <FaceFrownIcon className="h-6 w-6 text-red-600" />;
      default:
        return <MinusIcon className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600';
      case 'bearish':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) {
      return `$${(volume / 1e12).toFixed(2)}T`;
    } else if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toFixed(0)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Market Sentiment
        </h2>
        <ChartBarIcon className="h-5 w-5 text-gray-400" />
      </div>

      {/* Overall Sentiment */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-2">
          {getSentimentIcon(sentimentData.overall)}
          <span className={`text-2xl font-bold capitalize ${getSentimentColor(sentimentData.overall)}`}>
            {sentimentData.overall}
          </span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Sentiment Score:
          </span>
          <span className={`text-lg font-semibold ${getScoreColor(sentimentData.score)}`}>
            {sentimentData.score}/100
          </span>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(sentimentData.signals).map(([key, value]) => (
          <div key={key} className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {key === 'onChain' ? 'On-Chain' : key}
            </p>
            <div className="flex items-center justify-center space-x-1">
              <span className={`text-sm font-semibold ${getScoreColor(value)}`}>
                {value}%
              </span>
              {value >= 60 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fear & Greed Index */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fear & Greed Index
          </span>
          <span className={`text-sm font-semibold ${getScoreColor(sentimentData.fearGreedIndex)}`}>
            {sentimentData.fearGreedIndex}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              sentimentData.fearGreedIndex >= 70
                ? 'bg-green-600'
                : sentimentData.fearGreedIndex >= 40
                ? 'bg-yellow-500'
                : 'bg-red-600'
            }`}
            style={{ width: `${sentimentData.fearGreedIndex}%` }}
          ></div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">24h Volume</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatVolume(sentimentData.volume24h)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatVolume(sentimentData.marketCap)}
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default MarketSentiment;