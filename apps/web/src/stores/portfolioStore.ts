import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  baseCurrency: string;
  isActive: boolean;
  isPublic: boolean;
  settings?: {
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    rebalanceFrequency?: 'daily' | 'weekly' | 'monthly';
    allowAlerts?: boolean;
    trackDividends?: boolean;
  };
  holdings: PortfolioHolding[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  totalCost: number;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  source: string;
  lastPriceUpdate?: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DIVIDEND' | 'STAKING_REWARD';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  currency: string;
  source: string;
  notes?: string;
  executedAt: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  holdingsCount: number;
}

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  portfolioSummary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPortfolios: (token: string) => Promise<void>;
  fetchPortfolio: (id: string, token: string) => Promise<void>;
  fetchPortfolioSummary: (id: string, token: string) => Promise<void>;
  createPortfolio: (data: CreatePortfolioData, token: string) => Promise<void>;
  updatePortfolio: (id: string, data: Partial<CreatePortfolioData>, token: string) => Promise<void>;
  deletePortfolio: (id: string, token: string) => Promise<void>;
  addHolding: (portfolioId: string, data: AddHoldingData, token: string) => Promise<void>;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;
  clearError: () => void;
}

export interface CreatePortfolioData {
  name: string;
  description?: string;
  baseCurrency?: string;
  isPublic?: boolean;
  settings?: Portfolio['settings'];
}

export interface AddHoldingData {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  fees?: number;
  currency?: string;
  transactionType?: 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  source?: string;
  executedAt?: string;
  notes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiRequest = async (endpoint: string, options: RequestInit, token?: string) => {
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

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolios: [],
  currentPortfolio: null,
  portfolioSummary: null,
  isLoading: false,
  error: null,

  fetchPortfolios: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const portfolios = await apiRequest('/portfolio', { method: 'GET' }, token);
      set({ portfolios, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch portfolios');
    }
  },

  fetchPortfolio: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const portfolio = await apiRequest(`/portfolio/${id}`, { method: 'GET' }, token);
      set({ currentPortfolio: portfolio, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch portfolio');
    }
  },

  fetchPortfolioSummary: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest(`/portfolio/${id}/summary`, { method: 'GET' }, token);
      set({ 
        portfolioSummary: data.summary,
        currentPortfolio: data.portfolio,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch portfolio summary');
    }
  },

  createPortfolio: async (data: CreatePortfolioData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const newPortfolio = await apiRequest('/portfolio', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      
      set((state) => ({
        portfolios: [...state.portfolios, newPortfolio],
        isLoading: false,
      }));
      
      toast.success('Portfolio created successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to create portfolio');
      throw error;
    }
  },

  updatePortfolio: async (id: string, data: Partial<CreatePortfolioData>, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPortfolio = await apiRequest(`/portfolio/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, token);
      
      set((state) => ({
        portfolios: state.portfolios.map((p) => 
          p.id === id ? updatedPortfolio : p
        ),
        currentPortfolio: state.currentPortfolio?.id === id ? updatedPortfolio : state.currentPortfolio,
        isLoading: false,
      }));
      
      toast.success('Portfolio updated successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to update portfolio');
      throw error;
    }
  },

  deletePortfolio: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/portfolio/${id}`, { method: 'DELETE' }, token);
      
      set((state) => ({
        portfolios: state.portfolios.filter((p) => p.id !== id),
        currentPortfolio: state.currentPortfolio?.id === id ? null : state.currentPortfolio,
        isLoading: false,
      }));
      
      toast.success('Portfolio deleted successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to delete portfolio');
      throw error;
    }
  },

  addHolding: async (portfolioId: string, data: AddHoldingData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const newHolding = await apiRequest(`/portfolio/${portfolioId}/holdings`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      
      // Refresh portfolio data after adding holding
      await get().fetchPortfolio(portfolioId, token);
      await get().fetchPortfolioSummary(portfolioId, token);
      
      toast.success('Holding added successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to add holding');
      throw error;
    }
  },

  setCurrentPortfolio: (portfolio: Portfolio | null) => {
    set({ currentPortfolio: portfolio });
  },

  clearError: () => {
    set({ error: null });
  },
}));