// ts-client/src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import HeroSection from "./pages/learner/HeroSection";
import MainLayout from "./layout/MainLayout";
import Courses from "./pages/learner/Courses";
import MyLearning from "./pages/learner/MyLearning";
import AllCourses from "./pages/learner/AllCourses";
import Profile from "./pages/learner/Profile";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import AddCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/learner/CourseDetail";
import CourseProgress from "./pages/learner/CourseProgress";
import SearchPage from "./pages/learner/SearchPage";
import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import ApiTest from "./components/ApiTest";
import LanguageDashboard from "./pages/learner/LanguageDashboard";
import UnitView from "./pages/learner/UnitView";
import LessonInterface from "./pages/learner/LessonInterface";
import LearningLayout from "./layout/LearningLayout";
import LearningFlowTest from "./components/LearningFlowTest";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "api-test",
        element: <ApiTest />,
      },
      {
        path: "test-learning-flow",
        element: <LearningFlowTest />,
      },
      {
        path: "learn",
        element: (
          <ProtectedRoute>
            <LearningLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true, // Default route for /learn
            element: <LanguageDashboard />,
          },
          {
            path: "unit/:unitId",
            element: <UnitView />,
          },
          {
            path: "lesson/:lessonId",
            element: <LessonInterface />,
          },
        ],
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "courses",
        element: (
          <ProtectedRoute>
            <AllCourses />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      // Admin Routes
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "course",
            element: <CourseTable />,
          },
          {
            path: "course/create",
            element: <AddCourse />,
          },
          {
            path: "course/:courseId",
            element: <EditCourse />,
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
        ],
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
              <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      // 404 handler
      {
        path: "*",
        element: <div>404 - Page not found</div>,
      },
    ],
  },
]);

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <RouterProvider router={appRouter} />
    </ThemeProvider>
  );
}

export default App;