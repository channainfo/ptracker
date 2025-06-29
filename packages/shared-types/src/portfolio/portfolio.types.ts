export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  currency: string;
  holdings: PortfolioHolding[];
  performance: PortfolioPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number; // Percentage of total portfolio
  lastUpdated: Date;
}

export interface PortfolioPerformance {
  id: string;
  portfolioId: string;
  period: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  startValue: number;
  endValue: number;
  gainLoss: number;
  gainLossPercent: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  sortinRatio?: number;
  volatility: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  currency?: string;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
}

export interface AddHoldingRequest {
  portfolioId: string;
  assetId: string;
  quantity: number;
  cost: number;
  date?: Date;
}

export interface UpdateHoldingRequest {
  quantity?: number;
  averageCost?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdingsCount: number;
  topHoldings: PortfolioHolding[];
  performanceHistory: PerformancePoint[];
}

export interface PerformancePoint {
  timestamp: Date;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioAllocation {
  assetType: 'crypto' | 'stock' | 'bond' | 'commodity' | 'cash';
  value: number;
  percentage: number;
  assets: {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
  }[];
}

export interface PortfolioAlert {
  id: string;
  portfolioId: string;
  type: 'price_target' | 'portfolio_value' | 'gain_loss' | 'allocation';
  condition: 'above' | 'below' | 'equals';
  targetValue: number;
  currentValue: number;
  isTriggered: boolean;
  isEnabled: boolean;
  message: string;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface PortfolioRebalancing {
  id: string;
  portfolioId: string;
  targetAllocations: Record<string, number>; // symbol -> percentage
  currentAllocations: Record<string, number>;
  recommendedTrades: RebalancingTrade[];
  expectedCost: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  executedAt?: Date;
}

export interface RebalancingTrade {
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  estimatedPrice: number;
  estimatedCost: number;
}