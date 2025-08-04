// ts-client/src/types/components.ts
// Component prop interfaces

import { ReactNode } from 'react';
import { User, Course, FreeLesson, Exercise, VocabularyItem } from './models';

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Layout props
export interface MainLayoutProps extends BaseComponentProps {
  showNavbar?: boolean;
  showFooter?: boolean;
}

export interface LearningLayoutProps extends BaseComponentProps {
  course?: Course;
  currentLessonId?: string;
}

// Navigation props
export interface NavbarProps extends BaseComponentProps {
  user?: User;
  isAuthenticated?: boolean;
}

// Authentication props
export interface GoogleLoginWrapperProps extends BaseComponentProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'Learner' | 'Instructor';
}

export interface PurchaseCourseProtectedRouteProps {
  children: ReactNode;
  courseId: string;
}

// Course components props
export interface CourseCardProps extends BaseComponentProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  showPrice?: boolean;
  showProgress?: boolean;
}

export interface BuyCourseButtonProps extends BaseComponentProps {
  course: Course;
  isEnrolled?: boolean;
  onPurchaseSuccess?: () => void;
}

// Learning components props
export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
  timeSpent: number;
}

export interface ExerciseRendererProps extends BaseComponentProps {
  exercise: Exercise;
  onExerciseComplete: (result: ExerciseResult) => void;
}

export interface VocabularySectionProps extends BaseComponentProps {
  vocabulary: VocabularyItem[];
  onComplete: () => void;
}

export interface LessonResult {
  accuracy: number;
  passed: boolean;
  needsReview: boolean;
  minimumRequired?: number;
  totalExercises: number;
  correctAnswers: number;
  timeSpent: number;
}

export interface UserProgress {
  recentLessons?: Array<{
    lessonId: string;
    status: string;
  }>;
}

export interface LessonCompletionModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  lessonResult: LessonResult | null;
  lessonTitle: string;
  currentLessonId: string;
  userProgress?: UserProgress | null;
  onContinue?: () => void;
}

// Progress components props
export interface ProgressBarProps extends BaseComponentProps {
  progress: number;
  total: number;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface CourseProgressProps extends BaseComponentProps {
  courseId: string;
  userId: string;
}

// Loading and error states
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

// Form props
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface SelectProps extends FormFieldProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

// Modal props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Admin component props (low priority for now)
export interface AdminDashboardProps extends BaseComponentProps {
  user: User;
}

export interface CourseManagementProps extends BaseComponentProps {
  courses: Course[];
  onCourseUpdate?: (course: Course) => void;
  onCourseDelete?: (courseId: string) => void;
}