export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ValidationError extends ApiError {
  field: string;
  value?: any;
  constraints: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface QueryParams extends PaginationParams, FilterParams {
  sort?: SortParams[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export enum ApiErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business logic errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_OPERATION = 'INVALID_OPERATION',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: Date;
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
}