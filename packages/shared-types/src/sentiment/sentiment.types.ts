export interface SentimentData {
  id: string;
  assetId: string;
  symbol: string;
  score: number; // -1 to 1 scale
  confidence: number; // 0 to 1 scale
  volume: number; // Number of mentions
  sources: SentimentSource[];
  timestamp: Date;
  period: '5m' | '15m' | '1h' | '4h' | '24h';
}

export interface SentimentSource {
  platform: 'twitter' | 'reddit' | 'telegram' | 'discord' | 'news' | 'blogs';
  mentions: number;
  avgScore: number;
  topPosts?: SocialPost[];
}

export interface SocialPost {
  id: string;
  platform: string;
  author: string;
  content: string;
  url?: string;
  score: number;
  confidence: number;
  mentions: string[]; // Asset symbols mentioned
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  createdAt: Date;
}

export interface SentimentTrend {
  symbol: string;
  timeframe: '1h' | '24h' | '7d' | '30d';
  data: SentimentPoint[];
  averageScore: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  peakScore: number;
  lowScore: number;
}

export interface SentimentPoint {
  timestamp: Date;
  score: number;
  volume: number;
  confidence: number;
}

export interface SentimentAlert {
  id: string;
  userId: string;
  assetId: string;
  symbol: string;
  type: 'score_threshold' | 'volume_spike' | 'trend_change';
  condition: 'above' | 'below' | 'spike' | 'drop';
  threshold: number;
  currentValue: number;
  isTriggered: boolean;
  isEnabled: boolean;
  message: string;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface SentimentAnalysis {
  symbol: string;
  overallScore: number;
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  breakdown: {
    social: number;
    news: number;
    technical: number;
    onChain?: number;
  };
  keyDrivers: string[];
  riskFactors: string[];
  opportunities: string[];
  lastUpdated: Date;
}

export interface FearGreedIndex {
  value: number; // 0-100 scale
  classification: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  components: {
    volatility: number;
    marketMomentum: number;
    socialMedia: number;
    surveys: number;
    dominance: number;
    trends: number;
  };
  lastUpdated: Date;
  history: FearGreedPoint[];
}

export interface FearGreedPoint {
  timestamp: Date;
  value: number;
  classification: string;
}

export interface SentimentMetrics {
  totalMentions: number;
  uniqueAuthors: number;
  avgEngagement: number;
  topPlatforms: PlatformMetric[];
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  influencerMentions: number;
  mediaAttention: number;
}

export interface PlatformMetric {
  platform: string;
  mentions: number;
  avgScore: number;
  engagement: number;
  reach: number;
}

export interface SentimentPrediction {
  symbol: string;
  timeframe: '1h' | '4h' | '24h' | '7d';
  predictedScore: number;
  confidence: number;
  factors: string[];
  lastUpdated: Date;
}