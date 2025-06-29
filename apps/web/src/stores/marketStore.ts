import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface HistoricalPrice {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

interface MarketState {
  topCoins: CoinPrice[];
  trendingCoins: TrendingCoin[];
  searchResults: any[];
  selectedCoin: CoinPrice | null;
  historicalData: HistoricalPrice | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTopCoins: (limit?: number, currency?: string, token?: string) => Promise<void>;
  fetchTrendingCoins: (token?: string) => Promise<void>;
  searchCoins: (query: string, token?: string) => Promise<void>;
  fetchCoinPrice: (symbol: string, currency?: string, token?: string) => Promise<void>;
  fetchHistoricalData: (symbol: string, days?: number, currency?: string, token?: string) => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiRequest = async (endpoint: string, options: RequestInit = {}, token?: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export const useMarketStore = create<MarketState>((set, get) => ({
  topCoins: [],
  trendingCoins: [],
  searchResults: [],
  selectedCoin: null,
  historicalData: null,
  isLoading: false,
  error: null,

  fetchTopCoins: async (limit = 100, currency = 'usd', token?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        currency,
      });
      
      const coins = await apiRequest(`/market/coins/top?${params}`, {}, token);
      set({ topCoins: coins, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch top coins');
    }
  },

  fetchTrendingCoins: async (token?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Note: This would require implementing a trending endpoint in the API
      // For now, we'll use the top coins as trending
      const coins = await apiRequest('/market/coins/top?limit=10', {}, token);
      set({ trendingCoins: coins.slice(0, 10), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch trending coins');
    }
  },

  searchCoins: async (query: string, token?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10',
      });
      
      const results = await apiRequest(`/market/coins/search?${params}`, {}, token);
      set({ searchResults: results, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to search coins');
    }
  },

  fetchCoinPrice: async (symbol: string, currency = 'usd', token?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({ currency });
      const coin = await apiRequest(`/market/coins/${symbol}/price?${params}`, {}, token);
      set({ selectedCoin: coin, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch coin price');
    }
  },

  fetchHistoricalData: async (symbol: string, days = 30, currency = 'usd', token?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        currency,
      });
      
      const data = await apiRequest(`/market/coins/${symbol}/history?${params}`, {}, token);
      set({ historicalData: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch historical data');
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));