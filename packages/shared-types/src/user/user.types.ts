export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum UserTier {
  NOVICE = 'novice',
  LEARNER = 'learner',
  TRADER = 'trader',
  EXPERT = 'expert',
  MASTER = 'master',
  LEGEND = 'legend',
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  walletAddress?: string;
  walletNetwork?: string;
  role: UserRole;
  tier: UserTier;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  loginCount: number;
  profilePicture?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  knowledgeScore: number;
  investmentScore: number;
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  priceAlerts: boolean;
  portfolioUpdates: boolean;
  marketNews: boolean;
  educationalContent: boolean;
  socialInteractions: boolean;
  tradingSignals: boolean;
}

export interface PrivacySettings {
  profilePublic: boolean;
  portfolioPublic: boolean;
  showOnLeaderboard: boolean;
  allowDirectMessages: boolean;
  shareAnalytics: boolean;
  allowDataExport: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  profilePicture?: string;
  notificationPreferences?: Partial<NotificationPreferences>;
  privacySettings?: Partial<PrivacySettings>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByTier: Record<UserTier, number>;
  usersByRole: Record<UserRole, number>;
  signupsToday: number;
  signupsThisWeek: number;
  signupsThisMonth: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'trade' | 'portfolio_update' | 'course_completed' | 'quiz_passed';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  chartType: 'line' | 'candlestick' | 'area';
  defaultTimeframe: '1h' | '4h' | '1d' | '1w' | '1m';
}