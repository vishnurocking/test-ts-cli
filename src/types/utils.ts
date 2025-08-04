// ts-client/src/types/utils.ts
// Utility function types

// Browser detection types
export interface BrowserInfo {
  name: string;
  version: string;
  isChrome: boolean;
  chromeVersion: string | null;
  supportsFedCM: boolean;
  hasThirdPartyCookies: boolean;
  isMobile: boolean;
  platform: string;
  userAgent: string;
}

// Cookie utility types
export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface AuthCookies {
  accessToken?: string;
  refreshToken?: string;
  user?: string;
}

// API utility types
export interface ApiRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// File upload types
export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

// Validation types
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationSchema<T> {
  [K in keyof T]?: ValidationRule<T[K]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Date utility types
export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
  timezone?: string;
  locale?: string;
}

// Local storage types
export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expiry?: number;
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler = (value: string) => void;
export type ClickHandler = (event: React.MouseEvent) => void;
export type SubmitHandler = (event: React.FormEvent) => void;

// Debounce and throttle types
export interface DebounceOptions {
  wait: number;
  immediate?: boolean;
}

export interface ThrottleOptions {
  wait: number;
  leading?: boolean;
  trailing?: boolean;
}

// Error handling types
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor?: string;
  accentColor?: string;
  customProperties?: Record<string, string>;
}

// Route types
export interface RouteParams {
  [key: string]: string | undefined;
}

export interface NavigationState {
  from?: string;
  returnTo?: string;
  [key: string]: any;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Performance monitoring types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests?: number;
}