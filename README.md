# TypeScript Frontend Documentation

## Overview

This is the TypeScript frontend for the Language Learning + Video Course Platform (Duolingo-style + Udemy-style). The application has been fully migrated from JavaScript to TypeScript with comprehensive type safety.

## Tech Stack

- **React 18** - UI library
- **TypeScript 5.3** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit + RTK Query** - State management and API calls
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library (Radix UI based)
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Project Structure

```
ts-client/
├── src/
│   ├── app/                    # Redux store configuration
│   │   ├── store.ts           # Main store setup
│   │   └── hooks.ts           # Typed Redux hooks
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components (18 files)
│   │   ├── Navbar.tsx        # Main navigation
│   │   ├── LoadingSpinner.tsx
│   │   └── ...              # Other shared components
│   ├── features/             # Feature-based modules
│   │   ├── api/             # RTK Query API slices
│   │   │   ├── authApi.ts   # Authentication with Chrome FedCM
│   │   │   ├── courseApi.ts # Course management
│   │   │   └── ...         # Other API slices
│   │   ├── authSlice.ts    # Auth state management
│   │   └── ...             # Other feature slices
│   ├── hooks/               # Custom React hooks
│   │   ├── useEnhancedLogout.ts # Chrome-specific logout
│   │   └── ...             # Other custom hooks
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.tsx   # Main app layout
│   │   └── AdminLayout.tsx  # Admin panel layout
│   ├── lib/                 # Utilities
│   │   └── utils.ts        # Helper functions
│   ├── pages/              # Route components
│   │   ├── admin/          # Admin pages
│   │   ├── learner/        # Learning platform pages
│   │   └── ...            # Other pages
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Central type exports
│   │   ├── models.ts       # Data models
│   │   ├── api.ts          # API types
│   │   └── ...            # Other type files
│   ├── utils/              # Utility functions
│   │   ├── browserUtils.ts # Browser detection
│   │   └── ...            # Other utilities
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tsconfig.node.json      # Node TypeScript config
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind configuration
```

## Key Features

### 1. Authentication System
- **Google OAuth** integration
- **Chrome FedCM** (Federated Credential Management) support
- Enhanced logout mechanism with browser-specific handling
- Cookie and storage management for fallback

### 2. Language Learning Platform
- **Vocabulary learning** with interactive cards
- **Exercise system** with multiple types:
  - Translation exercises
  - Multiple choice questions
  - Fill in the blank
  - Scenario responses
- **Progress tracking** with Redux state
- **Lesson completion** with 58% passing threshold

### 3. Video Course Platform
- **Course creation** and management
- **Video lectures** with Cloudinary integration
- **Rich text editor** for course descriptions
- **Payment integration** with Razorpay

### 4. Admin Dashboard
- **Sales analytics** with charts (Recharts)
- **Course management** (CRUD operations)
- **Lecture management** with video uploads
- **Revenue tracking** and reporting

## Type System

### Core Type Definitions

```typescript
// User model
interface User {
  userId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: "user" | "instructor";
  enrolledCourses: string[];
}

// Course model
interface Course {
  courseId: string;
  courseTitle: string;
  category: string;
  coursePrice: string;
  courseThumbnail?: string;
  lectures: Lecture[];
  isPublished: boolean;
}

// Lesson model (language learning)
interface FreeLesson {
  lessonId: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  vocabulary: VocabularyItem[];
  exercises: Exercise[];
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthResponse extends ApiResponse<User> {
  sessionInfo?: SessionInfo;
}
```

## API Integration

### RTK Query Setup

All API calls use RTK Query with proper TypeScript typing:

```typescript
// Example API slice
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: enhancedBaseQuery, // Custom base query with Chrome FedCM headers
  endpoints: (builder) => ({
    loginUser: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});
```

### Chrome FedCM Compatibility

Special headers are added for Chrome browser detection:

```typescript
const enhancedBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const browserInfo = getBrowserInfo();
    if (browserInfo.isChrome) {
      headers.set("X-Browser", "Chrome");
      if (browserInfo.supportsFedCM) {
        headers.set("X-Supports-FedCM", "true");
      }
    }
    return headers;
  },
});
```

## Component Architecture

### UI Components (shadcn/ui)

All 18 UI components are fully typed:
- Button, Card, Input, Label, Select
- Badge, Progress, Skeleton, Switch, Sheet
- Table, Dialog, Tabs, Avatar, Separator
- Checkbox, Dropdown Menu, Sonner (toasts)

### Page Components

Pages are organized by user role:
- **Learner Pages**: Dashboard, Lessons, Courses, Profile
- **Admin Pages**: Dashboard, Course Management, Analytics

## State Management

### Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  languageLearning: LanguageLearningState;
  courses: CourseState;
  // API slices added by RTK Query
}
```

### Redux Hooks

Custom typed hooks for Redux:

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Development Guidelines

### Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Code Style

- Use functional components with TypeScript
- Proper type annotations (avoid `any`)
- Consistent file naming (PascalCase for components)
- Comprehensive error handling

### Browser Compatibility

Special considerations for Chrome FedCM:
- Browser detection utilities
- Fallback mechanisms for non-Chrome browsers
- Enhanced logout flow with multiple strategies

## Deployment

### Environment Variables

```env
VITE_API_BASE_URL=your_api_url
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

### Build Output

The build creates optimized assets in `dist/` directory:
- Minified JavaScript bundles
- Optimized CSS
- Static assets with hashing

## Testing

### Type Safety

TypeScript provides compile-time type checking:
- Prevents runtime errors
- Ensures API contract compliance
- Validates component props

### Recommended Testing

```bash
# Run type checking
npm run type-check

# Linting (if configured)
npm run lint
```

## Migration Notes

This frontend was migrated from JavaScript to TypeScript:
- 80+ files converted with full type safety
- All functionality preserved
- Enhanced developer experience with IntelliSense
- Zero JavaScript files remaining

## Support

For issues or questions:
- Check TypeScript errors in VS Code
- Ensure all dependencies are installed
- Verify environment variables are set
- Check browser console for runtime errors