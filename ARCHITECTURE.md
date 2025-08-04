# TypeScript Frontend Architecture

## Architecture Overview

The TypeScript frontend follows a modern React architecture with strong typing throughout the application.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React + TypeScript)         │
├─────────────────────────────────────────────────────────────┤
│                        Presentation Layer                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Pages    │  │  Components  │  │   UI Library     │   │
│  │  (Routes)   │  │  (Reusable)  │  │  (shadcn/ui)    │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                         State Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │Redux Store  │  │  RTK Query   │  │  Local State     │   │
│  │  (Global)   │  │ (API Cache)  │  │  (Component)     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                          Data Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  API Calls  │  │    Types     │  │    Utilities     │   │
│  │ (RTK Query) │  │ (TypeScript) │  │  (Helpers)       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend APIs      │
                    │  (Node.js + AWS)    │
                    └─────────────────────┘
```

## Core Design Patterns

### 1. Feature-Based Architecture

```
features/
├── api/                    # API layer (RTK Query)
│   ├── authApi.ts         # Auth endpoints
│   ├── courseApi.ts       # Course endpoints
│   └── userProgressApi.ts # Progress tracking
├── authSlice.ts           # Auth state
└── languageLearningSlice.ts # Learning state
```

### 2. Type-First Development

All data flows through strongly typed interfaces:

```typescript
// API Response Type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Component Props Type
interface LessonInterfaceProps {
  lessonId: string;
  onComplete?: (result: LessonResult) => void;
}

// Hook Return Type
interface UseEnhancedLogoutReturn {
  logout: (options?: LogoutOptions) => Promise<void>;
  isLoggingOut: boolean;
}
```

### 3. Smart vs Presentational Components

**Smart Components** (Connected to Redux):
```typescript
// pages/learner/Dashboard.tsx
const Dashboard = () => {
  const user = useAppSelector(selectUser);
  const { data: progress } = useGetUserProgressQuery();
  // Business logic here
};
```

**Presentational Components** (Pure UI):
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
}
```

## State Management Strategy

### 1. Global State (Redux)

Used for:
- User authentication state
- Current lesson progress
- Theme preferences
- UI state (modals, sidebars)

### 2. Server State (RTK Query)

Managed automatically for:
- User data
- Course listings
- Lesson content
- Progress tracking

### 3. Local State (useState/useReducer)

Used for:
- Form inputs
- UI toggles
- Temporary data
- Component-specific state

## API Layer Architecture

### Base Query Configuration

```typescript
const enhancedBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Chrome FedCM support
    const browserInfo = getBrowserInfo();
    if (browserInfo.isChrome) {
      headers.set("X-Browser", "Chrome");
      headers.set("X-Supports-FedCM", browserInfo.supportsFedCM ? "true" : "false");
    }
    return headers;
  },
});
```

### API Slice Pattern

```typescript
export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: enhancedBaseQuery,
  tagTypes: ["Course", "Lecture"],
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => "/courses",
      providesTags: ["Course"],
    }),
    createCourse: builder.mutation<Course, CreateCourseDto>({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Course"],
    }),
  }),
});
```

## Routing Architecture

### Route Structure

```typescript
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<HeroSection />} />
    <Route path="/login" element={<Login />} />
    
    {/* Protected Routes - Learner */}
    <Route element={<ProtectedRoute />}>
      <Route path="/learn" element={<Dashboard />} />
      <Route path="/learn/lesson/:lessonId" element={<LessonInterface />} />
    </Route>
    
    {/* Protected Routes - Admin */}
    <Route element={<ProtectedRoute requiredRole="instructor" />}>
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="course" element={<CourseTable />} />
      </Route>
    </Route>
  </Routes>
);
```

### Route Protection

```typescript
const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <Outlet />;
};
```

## Component Patterns

### 1. Compound Components

```typescript
// Table compound component
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Content</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 2. Render Props Pattern

```typescript
<DataProvider
  render={(data) => (
    <div>{data.map(item => <Item key={item.id} {...item} />)}</div>
  )}
/>
```

### 3. Custom Hooks Pattern

```typescript
// Encapsulate complex logic
const useEnhancedLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const logout = useCallback(async () => {
    // Complex logout logic
  }, [dispatch, navigate]);
  
  return { logout };
};
```

## Performance Optimizations

### 1. Code Splitting

```typescript
// Lazy load admin routes
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
```

### 2. Memoization

```typescript
// Memoize expensive computations
const expensiveResult = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize components
const MemoizedComponent = memo(Component);
```

### 3. RTK Query Caching

```typescript
// Cache configuration
getCourses: builder.query({
  query: () => "/courses",
  keepUnusedDataFor: 60, // Keep cache for 60 seconds
});
```

## Error Handling

### Global Error Boundary

```typescript
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
const { data, error, isLoading } = useGetCoursesQuery();

if (error) {
  if ("status" in error) {
    return <div>Error: {error.status}</div>;
  }
  return <div>An error occurred</div>;
}
```

## Security Considerations

### 1. Authentication Flow

- OAuth 2.0 with Google
- Chrome FedCM support
- Secure cookie handling
- CSRF protection

### 2. Data Validation

- Zod schemas for form validation
- TypeScript for compile-time safety
- Runtime validation for API responses

### 3. XSS Prevention

- React's built-in escaping
- Careful with dangerouslySetInnerHTML
- Content Security Policy headers

## Browser Compatibility

### Chrome FedCM Support

```typescript
// Browser detection
const getBrowserInfo = (): BrowserInfo => {
  const isChrome = /Chrome/.test(navigator.userAgent);
  const supportsFedCM = isChrome && "IdentityCredential" in window;
  
  return {
    isChrome,
    supportsFedCM,
    version: getBrowserVersion(),
  };
};
```

### Fallback Strategies

1. **Authentication**: Cookie-based fallback for non-Chrome
2. **Storage**: LocalStorage → SessionStorage → Cookies
3. **Features**: Progressive enhancement approach

## Testing Strategy

### Type Testing

```bash
# Compile-time type checking
npm run type-check
```

### Component Testing

```typescript
// Example test structure
describe("LessonInterface", () => {
  it("should validate exercise answers", () => {
    const result = validateExerciseResult(exercise, userAnswer);
    expect(result).toBe(true);
  });
});
```

## Build & Deployment

### Build Process

1. **TypeScript Compilation**: TSC validates types
2. **Vite Bundling**: Optimizes and bundles code
3. **Asset Optimization**: Images, fonts, CSS
4. **Code Splitting**: Dynamic imports for routes

### Environment Configuration

```typescript
// Environment-specific configs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IS_PRODUCTION = import.meta.env.PROD;
```

## Future Considerations

### Scalability

- Micro-frontend architecture for large teams
- Module federation for independent deployments
- Server-side rendering for SEO

### Performance

- React Server Components
- Streaming SSR
- Edge computing for global distribution

### Developer Experience

- Storybook for component documentation
- Automated testing pipelines
- Enhanced TypeScript strict mode