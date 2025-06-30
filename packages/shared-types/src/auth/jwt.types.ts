export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  role: string;
  tier: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
  sessionId?: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: JwtPayload;
  error?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  issuer?: string;
  audience?: string;
}