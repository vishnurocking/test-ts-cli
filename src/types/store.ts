// ts-client/src/types/store.ts
// Redux store and state types

import { User, FreeLesson } from './models';

// Auth slice state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

// Language learning slice state
export interface LanguageLearningState {
  currentLesson: FreeLesson | null;
  currentUnit: string | null;
  completedLessons: string[];
  progress: Record<string, {
    accuracy: number;
    timeSpent: number;
    attempts: number;
    completed: boolean;
  }>;
  streak: number;
  totalPoints: number;
  isLoading: boolean;
  error: string | null;
}

// UI slice state (if needed)
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: {
    [key: string]: boolean;
  };
}

// Notification type
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// Course slice state (if needed)
export interface CourseState {
  courses: any[];
  currentCourse: any;
  enrolledCourses: string[];
  progress: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

// Root state type (will be inferred from store)
export interface RootState {
  auth: AuthState;
  languageLearning: LanguageLearningState;
  ui?: UIState;
  course?: CourseState;
  // RTK Query API slices will be added automatically
}

// Action types for manual actions (if needed)
export interface AuthAction {
  type: string;
  payload?: any;
}

export interface LanguageLearningAction {
  type: string;
  payload?: any;
}

// Thunk action types
export interface AppThunk<ReturnType = void> {
  (dispatch: any, getState: () => RootState): ReturnType;
}

// Selector types
export type AppSelector<Selected = unknown> = (state: RootState) => Selected;

// Middleware types
export interface SerializedError {
  name?: string;
  message?: string;
  stack?: string;
  code?: string;
}

// RTK Query base query types
export interface BaseQueryError {
  status: number;
  data: any;
}

// Enhanced auth state for Chrome compatibility
export interface EnhancedAuthState extends AuthState {
  browserInfo?: {
    isChrome: boolean;
    version: string;
    supportsFedCM: boolean;
  };
  logoutAttempts: number;
  lastLogoutError: string | null;
}