// ts-client/src/types/models.ts
// Data models imported from backend types

// PostgreSQL Models
export interface User {
  user_id: string;
  email: string;
  name: string;
  nickname?: string;
  google_id?: string;
  password?: string;
  role: 'Learner' | 'Instructor';
  enrolled_courses?: string[];
  
  // Gamification fields
  points: number;
  level: number;
  streak: number;
  last_login_date?: Date;
  language_preference?: string;
  
  // Enhanced fields
  mother_tongue?: string;
  primary_target_language?: string;
  proficiency_level?: string;
  daily_time_commitment?: number;
  timezone?: string;
  is_active?: boolean;
  onboarding_completed?: boolean;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface Purchase {
  purchase_id: string;
  user_id: string;
  course_id: string;
  course_title?: string;
  course_thumbnail?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Razorpay fields
  payment_id?: string;
  order_id?: string;
  payment_signature?: string;
  
  // Enhanced fields
  payment_method?: string;
  processing_fee?: number;
  refund_amount?: number;
  content_type?: string;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

// DynamoDB Models
export interface Course {
  PK: string;
  SK: string;
  courseId: string;
  courseTitle: string;
  subTitle?: string;
  description?: string;
  category: string;
  courseLevel: string;
  coursePrice: number | string;
  courseThumbnail?: string;
  courseThumbnailPublicId?: string;
  creator: string;
  isPublished: boolean; // Always boolean in TypeScript version
  createdAt: string;
  
  // Enhanced fields
  primaryLanguage?: string;
  supportedLanguages?: string[];
  contentType?: string;
  difficulty?: string;
  estimatedDuration?: number;
  tags?: string[];
  isActive?: boolean;
  enrolledStudents?: string[]; // Added from sample data
  
  // GSI attributes
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  GSI3PK?: string;
  GSI3SK?: string;
}

export interface Lecture {
  PK: string;
  SK: string;
  lectureId: string;
  lectureTitle: string;
  videoUrl?: string;
  publicId?: string;
  isPreviewFree: boolean;
  createdAt: string;
  
  // Enhanced fields
  duration?: number;
  transcriptUrl?: string;
  subtitleUrls?: Record<string, string>;
  viewCount?: number;
  difficulty?: string;
}

export interface CourseProgress {
  PK: string;
  SK: string;
  userId: string;
  courseId: string;
  lectureProgress: Record<string, boolean>;
  completed: boolean;
  lastAccessed: string;
  
  // Enhanced fields
  progressPercentage?: number;
  totalTimeSpent?: number;
  currentLectureId?: string;
  completedAt?: string;
  rating?: number;
  studyStreak?: number;
}

export interface FreeLesson {
  PK?: string; // Optional for API responses
  SK?: string; // Optional for API responses
  lessonId: string;
  unitId?: string; // Optional in TypeScript version
  lessonOrder: number;
  title: string;
  titleHindi?: string;
  description?: string;
  descriptionHindi?: string; // Added from sample data
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites?: string[];
  vocabulary?: VocabularyItem[];
  exercises?: Exercise[];
  isActive: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  
  // Enhanced fields
  supportedLanguages?: string[];
  tags?: string[];
  competencyLevel?: string;
  practiceType?: string;
  audioUrl?: string;
  imageUrl?: string;
  completionRate?: number;
  averageRating?: number;
}

export interface VocabularyItem {
  english: string;
  hindi: string;
  pronunciation?: string;
  example?: string;
  
  // Enhanced fields
  audioUrl?: string;
  imageUrl?: string;
  difficulty?: string;
  frequency?: string;
}

export interface Exercise {
  exerciseId: string;
  type: 'multiple_choice' | 'fill_blank' | 'translation';
  question: string;
  sentence?: string;
  hindiText?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  hint?: string;
  
  // Enhanced fields
  difficulty?: number;
  timeLimit?: number;
  points?: number;
  audioQuestion?: string;
  audioOptions?: string[];
}

export interface UserProgress {
  PK: string;
  SK: string;
  userId: string;
  lessonId: string;
  unitId: string;
  status: 'completed' | 'in_progress' | 'failed';
  accuracy: number;
  timeSpent: number;
  attempts: number;
  exerciseResults: ExerciseResult[];
  lastAccessed: string;
  createdAt: string;
  
  // Enhanced fields
  streak?: number;
  totalPoints?: number;
  bestAccuracy?: number;
  averageTime?: number;
  hintsUsed?: number;
  completedAt?: string;
  preferredLanguage?: string;
  studyMode?: string;
}

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string | number;
  correct: boolean;
  timeSpent: number;
  attempts: number;
  
  // Enhanced fields
  hintsUsed?: number;
  difficulty?: number;
  confidence?: number;
  timestamp?: string;
}

// Progress tracking
export interface UnitProgress {
  unitId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lastAccessedLesson?: string;
}