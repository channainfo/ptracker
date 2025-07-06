/**
 * API Client with automatic token management and request interceptors
 * Enhanced with security features and better error handling
 */

export interface ApiError {
  message: string;
  statusCode?: number;
  field?: string;
  timestamp?: number;
  requestId?: string;
}

interface RequestConfig extends RequestInit {
  retries?: number;
  timeout?: number;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private secureStorage: boolean = false;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.secureStorage = this.isSecureEnvironment();
    this.loadTokensFromStorage();
  }

  private isSecureEnvironment(): boolean {
    return typeof window !== 'undefined' && window.location.protocol === 'https:';
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        if (this.secureStorage) {
          // Try to get tokens from secure storage (httpOnly cookies)
          // This would require server-side implementation
          this.accessToken = this.getSecureCookie('accessToken');
          this.refreshToken = this.getSecureCookie('refreshToken');
        }
        
        // Fallback to localStorage if secure storage not available
        if (!this.accessToken || !this.refreshToken) {
          this.accessToken = localStorage.getItem('accessToken');
          this.refreshToken = localStorage.getItem('refreshToken');
        }
      } catch (error) {
        console.warn('Failed to load tokens from storage:', error);
        this.clearTokens();
      }
    }
  }

  private getSecureCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (typeof window !== 'undefined') {
      try {
        // Store tokens securely
        if (this.secureStorage) {
          // In production, this should be handled by server-side cookies
          this.setSecureCookie('accessToken', accessToken);
          this.setSecureCookie('refreshToken', refreshToken);
        } else {
          // Development fallback to localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Set last activity timestamp
        localStorage.setItem('lastActivity', Date.now().toString());
      } catch (error) {
        console.warn('Failed to store tokens:', error);
      }
    }
  }

  private setSecureCookie(name: string, value: string): void {
    if (typeof document === 'undefined') return;
    
    const secure = this.secureStorage ? '; Secure' : '';
    const sameSite = '; SameSite=Strict';
    const httpOnly = ''; // Note: httpOnly cannot be set from client-side JS
    
    document.cookie = `${name}=${value}; Path=/${secure}${sameSite}${httpOnly}`;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      try {
        // Clear from all storage types
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('lastActivity');
        
        // Clear secure cookies
        if (this.secureStorage) {
          this.clearSecureCookie('accessToken');
          this.clearSecureCookie('refreshToken');
        }
      } catch (error) {
        console.warn('Failed to clear tokens:', error);
      }
    }
  }

  private clearSecureCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async refreshTokens(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
  }

  private async handleApiError(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, use status text
      errorData = { message: response.statusText };
    }

    // Handle different API error formats
    let errorMessage: string;
    if (errorData.message) {
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message[0];
      } else {
        errorMessage = errorData.message;
      }
    } else if (errorData.error) {
      errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message;
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }

    const apiError: ApiError = {
      message: errorMessage,
      statusCode: response.status,
      field: errorData.field,
      timestamp: Date.now(),
      requestId: response.headers.get('x-request-id') || undefined
    };

    // Log security-related errors
    if (response.status === 401 || response.status === 403) {
      console.warn('Security error:', apiError);
    }

    throw apiError;
  }

  private async requestWithTimeout(url: string, config: RequestInit, timeout = 30000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async request<T = any>(
    endpoint: string, 
    options: RequestConfig = {}
  ): Promise<T> {
    const { retries = 3, timeout = 30000, ...requestOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();
    
    const config: RequestInit = {
      credentials: 'include', // Important for CORS with cookies
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Client-Version': '1.0.0',
        ...requestOptions.headers,
      },
      ...requestOptions,
    };

    // Add auth header if we have a token and it's not a refresh request
    if (this.accessToken && !endpoint.includes('/refresh')) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    let response = await this.requestWithTimeout(url, config, timeout);

    // Handle token refresh on 401
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/refresh')) {
      try {
        await this.refreshTokens();
        
        // Retry the original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.accessToken}`,
        };
        response = await this.requestWithTimeout(url, config, timeout);
      } catch (refreshError) {
        this.clearTokens();
        // Let the original 401 response be handled below
      }
    }

    if (!response.ok) {
      await this.handleApiError(response);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as any;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods with enhanced options
  async get<T = any>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  // Security methods
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  validateResponse(response: Response): boolean {
    // Check for suspicious response headers or content
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      console.warn('Unexpected content type:', contentType);
      return false;
    }
    return true;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for use in other files
export type { ApiError, RequestConfig, TokenData };