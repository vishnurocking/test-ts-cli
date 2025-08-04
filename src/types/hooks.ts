// ts-client/src/types/hooks.ts
// Custom hook types

import { User } from './models';

// Authentication hooks
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Enhanced logout hook (Chrome FedCM compatibility)
export interface UseEnhancedLogoutReturn {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  logoutError: string | null;
  retryLogout: () => Promise<void>;
  emergencyLogout: () => void;
}

// Browser detection hook
export interface UseBrowserDetectionReturn {
  isChrome: boolean;
  chromeVersion: string | null;
  supportsFedCM: boolean;
  hasThirdPartyCookies: boolean;
  browserInfo: {
    name: string;
    version: string;
    isMobile: boolean;
    platform: string;
  };
}

// Course progress hook
export interface UseCourseProgressReturn {
  progress: Record<string, boolean>;
  overallProgress: number;
  isLoading: boolean;
  error: string | null;
  updateProgress: (lectureId: string, completed: boolean) => Promise<void>;
  resetProgress: () => void;
}

// Learning session hook
export interface UseLearningSessionReturn {
  currentLesson: any;
  isLoading: boolean;
  error: string | null;
  startSession: (lessonId: string) => void;
  completeLesson: (results: any) => Promise<void>;
  nextLesson: () => void;
  previousLesson: () => void;
}

// File upload hook
export interface UseFileUploadReturn {
  upload: (file: File) => Promise<string>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  reset: () => void;
}

// Local storage hook
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// API query hook return types
export interface UseApiQueryReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
}

export interface UseApiMutationReturn<T, V> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  error: any;
  reset: () => void;
}

// Theme hook
export interface UseThemeReturn {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

// Form validation hook
export interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validate: () => boolean;
  reset: () => void;
}