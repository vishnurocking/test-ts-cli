# API Reference - TypeScript Frontend

## Overview

This document provides a comprehensive reference for all API endpoints used in the TypeScript frontend, including request/response types and usage examples.

## Base Configuration

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
```

## Authentication API

### Login User

```typescript
// Endpoint
POST /user/login

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  sessionInfo?: {
    sessionId: string;
    expiresAt: string;
  };
}

// Usage
const [login] = useLoginUserMutation();

const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const result = await login(credentials).unwrap();
    console.log(result.user);
  } catch (error) {
    console.error(error);
  }
};
```

### Logout User

```typescript
// Endpoint
POST /user/logout

// Types
interface LogoutOptions {
  sessionId?: string;
  clearAllSessions?: boolean;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

// Usage
const [logout] = useLogoutUserMutation();
```

### Load User

```typescript
// Endpoint
GET /user/me

// Types
interface LoadUserResponse {
  success: boolean;
  user: User;
}

// Usage
const { data, isLoading } = useLoadUserQuery();
```

## Course API

### Get All Courses

```typescript
// Endpoint
GET /course

// Types
interface Course {
  courseId: string;
  courseTitle: string;
  subTitle: string;
  description: string;
  category: string;
  coursePrice: string;
  courseThumbnail?: string;
  isPublished: boolean;
  instructor: {
    name: string;
    profilePicture?: string;
  };
  lectures: Lecture[];
  enrolledStudents: number;
}

interface GetCoursesResponse {
  success: boolean;
  courses: Course[];
}

// Usage
const { data: courses, isLoading } = useGetPublishedCoursesQuery();
```

### Get Course by ID

```typescript
// Endpoint
GET /course/:courseId

// Types
interface GetCourseByIdResponse {
  success: boolean;
  course: Course;
}

// Usage
const { data, isLoading } = useGetCourseByIdQuery(courseId);
```

### Create Course (Admin)

```typescript
// Endpoint
POST /course

// Types
interface CreateCourseDto {
  courseTitle: string;
  category: string;
}

interface CreateCourseResponse {
  success: boolean;
  message: string;
  course: Course;
}

// Usage
const [createCourse] = useCreateCourseMutation();

const handleCreate = async (courseData: CreateCourseDto) => {
  const result = await createCourse(courseData).unwrap();
};
```

### Edit Course (Admin)

```typescript
// Endpoint
PUT /course/:courseId

// Types
interface EditCourseDto {
  courseTitle?: string;
  subTitle?: string;
  description?: string;
  category?: string;
  coursePrice?: string;
  courseThumbnail?: string;
  courseThumbnailPublicId?: string;
}

// Usage
const [editCourse] = useEditCourseMutation();

const handleEdit = async (courseId: string, courseData: EditCourseDto) => {
  const result = await editCourse({ courseId, courseData }).unwrap();
};
```

### Publish/Unpublish Course

```typescript
// Endpoint
PATCH /course/:courseId/publish?publish=true

// Types
interface PublishCourseResponse {
  success: boolean;
  message: string;
}

// Usage
const [publishCourse] = usePublishCourseMutation();

const togglePublish = async (courseId: string, publish: boolean) => {
  const result = await publishCourse({ courseId, query: publish }).unwrap();
};
```

## Lecture API

### Create Lecture

```typescript
// Endpoint
POST /course/:courseId/lecture

// Types
interface CreateLectureDto {
  lectureTitle: string;
  courseId: string;
}

interface Lecture {
  lectureId: string;
  lectureTitle: string;
  videoUrl?: string;
  publicId?: string;
  isPreviewFree: boolean;
}

// Usage
const [createLecture] = useCreateLectureMutation();
```

### Edit Lecture

```typescript
// Endpoint
PUT /course/:courseId/lecture/:lectureId

// Types
interface EditLectureDto {
  lectureTitle?: string;
  videoInfo?: {
    videoUrl: string;
    publicId: string;
  };
  isPreviewFree?: boolean;
}

// Usage
const [editLecture] = useEditLectureMutation();
```

## Purchase API

### Create Razorpay Order

```typescript
// Endpoint
POST /purchase/checkout/create-order

// Types
interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
}

// Usage
const [createOrder] = useCreateRazorpayOrderMutation();

const initiatePayment = async (courseId: string) => {
  const { order } = await createOrder(courseId).unwrap();
  // Use order with Razorpay SDK
};
```

### Verify Payment

```typescript
// Endpoint
POST /purchase/checkout/verify-payment

// Types
interface VerifyPaymentDto {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  courseId: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

// Usage
const [verifyPayment] = useVerifyPaymentMutation();
```

### Get Purchase History

```typescript
// Endpoint
GET /purchase

// Types
interface Purchase {
  purchaseId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  paymentId: string;
  createdAt: string;
}

interface GetPurchasesResponse {
  success: boolean;
  purchasedCourse: Purchase[];
}

// Usage
const { data: purchases } = useGetAllPurchasesQuery();
```

## Language Learning API

### Get All Lessons

```typescript
// Endpoint
GET /free-lessons

// Types
interface FreeLesson {
  lessonId: string;
  title: string;
  titleHindi: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  vocabulary: VocabularyItem[];
  exercises: Exercise[];
  order: number;
}

interface VocabularyItem {
  id: string;
  english: string;
  hindi: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleHindi: string;
}

interface Exercise {
  exerciseId: string;
  type: "translation" | "multiple_choice" | "fill_blank" | "scenario_response";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

// Usage
const { data: lessons } = useGetLessonsQuery();
```

### Get Lesson by ID

```typescript
// Endpoint
GET /free-lessons/:lessonId

// Types
interface GetLessonResponse {
  success: boolean;
  lesson: FreeLesson;
}

// Usage
const { data: lesson } = useGetLessonQuery(lessonId);
```

## User Progress API

### Start Lesson

```typescript
// Endpoint
POST /progress/lesson/start

// Types
interface StartLessonDto {
  lessonId: string;
  unitId: string;
}

interface StartLessonResponse {
  success: boolean;
  message: string;
}

// Usage
const [startLesson] = useStartLessonMutation();
```

### Complete Lesson

```typescript
// Endpoint
POST /progress/lesson/complete

// Types
interface CompleteLessonDto {
  lessonId: string;
  exerciseResults: ExerciseResult[];
  timeSpent: number; // in seconds
}

interface ExerciseResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  timeSpent: number;
}

interface CompleteLessonResponse {
  success: boolean;
  result: {
    passed: boolean;
    score: number;
    minimumRequired: number;
    needsReview: boolean;
  };
}

// Usage
const [completeLesson] = useCompleteLessonMutation();
```

### Get User Progress

```typescript
// Endpoint
GET /progress

// Types
interface UserProgress {
  completedLessons: string[];
  currentUnit: number;
  totalPoints: number;
  streak: number;
  lastActiveDate: string;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  icon: string;
}

// Usage
const { data: progress } = useGetUserProgressQuery();
```

## Course Progress API

### Get Course Progress

```typescript
// Endpoint
GET /course-progress/:courseId

// Types
interface CourseProgress {
  courseId: string;
  completedLectures: string[];
  completionPercentage: number;
  lastWatchedLecture?: string;
  totalWatchTime: number;
}

// Usage
const { data: progress } = useGetCourseProgressQuery(courseId);
```

## Error Handling

All API responses follow a consistent error format:

```typescript
interface ApiError {
  status: number;
  data: {
    success: false;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Usage in components
const { data, error, isLoading } = useGetCoursesQuery();

if (error) {
  if ('status' in error) {
    const apiError = error as ApiError;
    console.error(`Error ${apiError.status}: ${apiError.data.message}`);
  }
}
```

## Request Headers

### Standard Headers

```typescript
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Chrome FedCM Headers

```typescript
{
  "X-Browser": "Chrome",
  "X-Supports-FedCM": "true", // or "false"
  "X-Browser-Version": "120.0.0"
}
```

### Authentication Headers

Authentication is handled via HTTP-only cookies. No Bearer tokens in headers.

## Rate Limiting

API endpoints have the following rate limits:
- Authentication: 5 requests per minute
- Course listing: 100 requests per minute
- Purchase: 10 requests per minute
- Progress updates: 30 requests per minute

## Caching Strategy

RTK Query implements intelligent caching:

```typescript
// Cache for 5 minutes
getCourses: builder.query({
  query: () => "/courses",
  keepUnusedDataFor: 300, // 5 minutes
}),

// Invalidate cache on mutation
createCourse: builder.mutation({
  query: (data) => ({
    url: "/courses",
    method: "POST",
    body: data,
  }),
  invalidatesTags: ["Course"],
}),
```

## WebSocket Events (Future)

Planned WebSocket events for real-time features:

```typescript
interface WebSocketEvents {
  "lesson:progress": {
    lessonId: string;
    progress: number;
  };
  "achievement:earned": {
    achievement: Achievement;
  };
  "course:updated": {
    courseId: string;
    updates: Partial<Course>;
  };
}
```