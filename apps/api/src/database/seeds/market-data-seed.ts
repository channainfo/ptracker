// Market data and realistic price history for seeding
export const REALISTIC_CRYPTO_DATA = {
  BTC: {
    name: 'Bitcoin',
    currentPrice: 67420.50,
    priceHistory: [
      { date: '2023-01-01', price: 16500 },
      { date: '2023-03-01', price: 23000 },
      { date: '2023-06-01', price: 27000 },
      { date: '2023-09-01', price: 26000 },
      { date: '2023-12-01', price: 42000 },
      { date: '2024-03-01', price: 65000 },
      { date: '2024-06-01', price: 71000 },
      { date: '2024-09-01', price: 58000 },
      { date: '2024-12-01', price: 67420 },
    ],
    marketCap: 1324000000000,
    volume24h: 28500000000,
    category: 'Layer 1',
    description: 'The first and largest cryptocurrency by market cap'
  },
  ETH: {
    name: 'Ethereum',
    currentPrice: 3420.75,
    priceHistory: [
      { date: '2023-01-01', price: 1200 },
      { date: '2023-03-01', price: 1600 },
      { date: '2023-06-01', price: 1900 },
      { date: '2023-09-01', price: 1650 },
      { date: '2023-12-01', price: 2400 },
      { date: '2024-03-01', price: 3500 },
      { date: '2024-06-01', price: 3800 },
      { date: '2024-09-01', price: 2600 },
      { date: '2024-12-01', price: 3420 },
    ],
    marketCap: 411000000000,
    volume24h: 15200000000,
    category: 'Smart Contract',
    description: 'Leading smart contract platform and DeFi ecosystem'
  },
  SOL: {
    name: 'Solana',
    currentPrice: 145.82,
    priceHistory: [
      { date: '2023-01-01', price: 8.5 },
      { date: '2023-03-01', price: 22 },
      { date: '2023-06-01', price: 18 },
      { date: '2023-09-01', price: 20 },
      { date: '2023-12-01', price: 98 },
      { date: '2024-03-01', price: 185 },
      { date: '2024-06-01', price: 165 },
      { date: '2024-09-01', price: 135 },
      { date: '2024-12-01', price: 145 },
    ],
    marketCap: 67800000000,
    volume24h: 2100000000,
    category: 'Layer 1',
    description: 'High-performance blockchain for DeFi and Web3 apps'
  },
};

export const USER_BEHAVIOR_PATTERNS = {
  conservative: {
    tradingFrequency: 'low', // 1-3 trades per month
    riskTolerance: 'low',
    preferredAssets: ['BTC', 'ETH'],
    averageHoldTime: '6-12 months',
    portfolioSize: { min: 5000, max: 50000 }
  },
  moderate: {
    tradingFrequency: 'medium', // 1-2 trades per week
    riskTolerance: 'medium',
    preferredAssets: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'],
    averageHoldTime: '3-6 months',
    portfolioSize: { min: 2000, max: 25000 }
  },
  aggressive: {
    tradingFrequency: 'high', // 3-5 trades per week
    riskTolerance: 'high',
    preferredAssets: ['SOL', 'AVAX', 'NEAR', 'FTM', 'SAND', 'MATIC'],
    averageHoldTime: '1-3 months',
    portfolioSize: { min: 1000, max: 15000 }
  },
  whale: {
    tradingFrequency: 'medium',
    riskTolerance: 'low',
    preferredAssets: ['BTC', 'ETH', 'SOL'],
    averageHoldTime: '12+ months',
    portfolioSize: { min: 100000, max: 500000 }
  }
};

export const PORTFOLIO_STRATEGIES = [
  {
    name: 'Bitcoin Maximalist',
    allocation: { BTC: 80, ETH: 15, others: 5 },
    description: 'Focused on Bitcoin as digital gold',
    riskLevel: 'Medium'
  },
  {
    name: 'DeFi Summer',
    allocation: { ETH: 40, UNI: 20, LINK: 15, MATIC: 15, AVAX: 10 },
    description: 'Decentralized finance ecosystem play',
    riskLevel: 'High'
  },
  {
    name: 'Layer 1 Diversification',
    allocation: { ETH: 30, SOL: 25, ADA: 20, DOT: 15, NEAR: 10 },
    description: 'Diversified across blockchain platforms',
    riskLevel: 'Medium-High'
  },
  {
    name: 'Metaverse & Gaming',
    allocation: { ETH: 30, SAND: 25, MATIC: 20, FTM: 15, others: 10 },
    description: 'Virtual worlds and gaming tokens',
    riskLevel: 'Very High'
  },
  {
    name: 'Institutional Grade',
    allocation: { BTC: 50, ETH: 30, SOL: 10, ADA: 10 },
    description: 'Large-cap, established cryptocurrencies',
    riskLevel: 'Low-Medium'
  }
];

export function generateRealisticPriceMovement(basePrice: number, volatility: number = 0.05): number {
  // Generate realistic price movement using random walk with mean reversion
  const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
  const volatilityAdjusted = volatility * randomFactor;
  const meanReversion = Math.random() > 0.7 ? -volatilityAdjusted * 0.3 : 0;
  
  return basePrice * (1 + volatilityAdjusted + meanReversion);
}

export function getRealisticTransactionFees(amount: number, asset: string): number {
  const feeRates = {
    BTC: 0.0025, // 0.25%
    ETH: 0.002,  // 0.2%
    SOL: 0.001,  // 0.1%
    default: 0.0015 // 0.15%
  };
  
  const rate = feeRates[asset as keyof typeof feeRates] || feeRates.default;
  return amount * rate;
}