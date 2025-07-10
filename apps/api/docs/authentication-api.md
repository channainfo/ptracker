# Authentication & Security API Documentation

This document provides comprehensive information about the CryptoTracker API authentication system and security features.

## Authentication Overview

The API uses JWT (JSON Web Tokens) for authentication with access and refresh token pattern:
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens
- **Email Verification**: Required for account activation
- **Password Reset**: Secure token-based password recovery

## Base URL
```
https://api.ptracker.com/auth
```

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Description:** Creates a new user account and sends email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules:**
- Email must be valid format
- Password minimum 8 characters with uppercase, lowercase, number, and special character
- First name and last name required
- Email must be unique

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticates user credentials and returns tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "emailVerified": true,
    "lastLoginAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Requirements:**
- Email must be verified
- Account must be active
- Correct password required

### 3. Email Verification

**Endpoint:** `POST /auth/verify-email`

**Description:** Verifies user email address using token sent via email.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### 4. Refresh Tokens

**Endpoint:** `POST /auth/refresh`

**Description:** Generates new access and refresh tokens using valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Initiates password reset process by sending reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

### 6. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Resets user password using token from reset email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### 7. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidates refresh token and logs out user.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Social Authentication

### Google OAuth

**Endpoint:** `GET /auth/google`

**Description:** Initiates Google OAuth flow.

**Response:** Redirects to Google authorization page.

### Google OAuth Callback

**Endpoint:** `GET /auth/google/callback`

**Description:** Handles Google OAuth callback and creates/authenticates user.

**Response:** Redirects to frontend with tokens in query parameters.

### Facebook OAuth

**Endpoint:** `GET /auth/facebook`

**Description:** Initiates Facebook OAuth flow.

**Response:** Redirects to Facebook authorization page.

### Facebook OAuth Callback

**Endpoint:** `GET /auth/facebook/callback`

**Description:** Handles Facebook OAuth callback and creates/authenticates user.

**Response:** Redirects to frontend with tokens in query parameters.

## Authentication Headers

For protected endpoints, include the access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

## Error Responses

### Validation Errors (400)
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be stronger"
  ],
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### Too Many Requests (429)
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- Login attempts: 5 per minute per IP
- Registration: 3 per minute per IP
- Password reset: 1 per minute per IP
- Email verification: 1 per minute per email

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are invalidated on logout
- JWT secrets are environment-specific

### Account Security
- Email verification required
- Password reset tokens expire in 1 hour
- Account lockout after 5 failed login attempts
- Session invalidation on password change

## User Roles

### User (Default)
- Access to own portfolio data
- Create and manage portfolios
- View market data

### Moderator
- All user permissions
- Flag inappropriate content
- Access to moderation tools

### Admin
- All permissions
- User management
- System configuration
- Analytics access

## Two-Factor Authentication (2FA)

### Enable 2FA

**Endpoint:** `POST /auth/2fa/enable`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEHPK3PXP",
  "backupCodes": [
    "123456789",
    "987654321"
  ]
}
```

### Verify 2FA Setup

**Endpoint:** `POST /auth/2fa/verify`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "Two-factor authentication enabled successfully"
}
```

### Disable 2FA

**Endpoint:** `POST /auth/2fa/disable`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "password": "current-password",
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "Two-factor authentication disabled successfully"
}
```

### 2FA Login

When 2FA is enabled, login response includes:

```json
{
  "requires2FA": true,
  "tempToken": "temporary-token-for-2fa-completion"
}
```

Then complete login with:

**Endpoint:** `POST /auth/2fa/login`

**Request Body:**
```json
{
  "tempToken": "temporary-token-from-login",
  "token": "123456"
}
```

## Integration Examples

### JavaScript/TypeScript

```typescript
class AuthService {
  private baseUrl = 'https://api.ptracker.com/auth';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async register(userData: RegisterData) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    
    if (data.requires2FA) {
      return { requires2FA: true, tempToken: data.tempToken };
    }
    
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async refreshTokens() {
    if (!this.refreshToken) throw new Error('No refresh token');
    
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAuthHeaders() {
    return this.accessToken ? {
      'Authorization': `Bearer ${this.accessToken}`
    } : {};
  }
}
```

### React Hook

```typescript
import { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    // Check for existing tokens on app start
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user info
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (!result.requires2FA) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.clearTokens();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

This API provides a comprehensive authentication system with modern security practices, email verification, password recovery, social login, and two-factor authentication support.