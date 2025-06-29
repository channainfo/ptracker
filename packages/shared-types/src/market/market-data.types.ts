export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'forex' | 'commodity';
  category: string;
  description?: string;
  website?: string;
  whitepaper?: string;
  logo?: string;
  marketCap?: number;
  totalSupply?: number;
  circulatingSupply?: number;
  maxSupply?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Price {
  id: string;
  assetId: string;
  symbol: string;
  price: number;
  priceUsd: number;
  volume24h: number;
  marketCap: number;
  change1h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  percentChange30d: number;
  high24h: number;
  low24h: number;
  rank: number;
  lastUpdated: Date;
  source: string;
}

export interface PriceHistory {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  volumeChange24h: number;
  activeAssets: number;
  activePairs: number;
  lastUpdated: Date;
}

export interface TrendingAsset {
  asset: Asset;
  price: Price;
  rank: number;
  score: number;
  searchVolume: number;
  socialMentions: number;
  priceChangeRank: number;
  volumeChangeRank: number;
}

export interface MarketAlert {
  id: string;
  userId: string;
  assetId: string;
  symbol: string;
  type: 'price' | 'volume' | 'market_cap' | 'change';
  condition: 'above' | 'below' | 'equals' | 'percentage_change';
  targetValue: number;
  currentValue: number;
  isTriggered: boolean;
  isEnabled: boolean;
  message: string;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface Exchange {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  volume24h: number;
  volumeChange24h: number;
  trustScore: number;
  rank: number;
  established: number;
  country?: string;
  description?: string;
  tradingPairs: number;
  isActive: boolean;
}

export interface TradingPair {
  id: string;
  exchangeId: string;
  baseAsset: string;
  quoteAsset: string;
  symbol: string;
  price: number;
  volume24h: number;
  volumeChange24h: number;
  spread: number;
  lastTrade: Date;
  isActive: boolean;
}

export interface OrderBook {
  symbol: string;
  lastUpdated: Date;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: Date;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  relatedAssets: string[];
  imageUrl?: string;
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  type: 'announcement' | 'listing' | 'delisting' | 'fork' | 'upgrade' | 'partnership';
  impact: 'high' | 'medium' | 'low';
  assetIds: string[];
  startDate: Date;
  endDate?: Date;
  source?: string;
  sourceUrl?: string;
}