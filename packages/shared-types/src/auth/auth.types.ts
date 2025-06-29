export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'facebook' | 'twitter';
  token: string;
}

export interface WalletConnectRequest {
  address: string;
  signature: string;
  message: string;
  network: 'ethereum' | 'solana' | 'sui' | 'polygon';
}

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MfaVerifyRequest {
  token: string;
  code: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  device: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  lastActivity: Date;
  isActive: boolean;
}

export type AuthProvider = 'email' | 'google' | 'facebook' | 'twitter' | 'wallet';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  walletAddress?: string;
  walletNetwork?: string;
  role: 'user' | 'moderator' | 'admin';
  tier: 'novice' | 'learner' | 'trader' | 'expert' | 'master' | 'legend';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}