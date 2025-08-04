// ts-client/src/components/PurchaseCourseProtectedRoute.tsx

import { useGetCourseByIdQuery } from "@/features/api/courseApi";
import { useParams, Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import type { ReactNode } from "react";

interface PurchaseCourseProtectedRouteProps {
  children: ReactNode;
}

const PurchaseCourseProtectedRoute = ({ 
  children 
}: PurchaseCourseProtectedRouteProps): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>();
  
  // Use the unified hook and get all relevant states
  const { data, isLoading, isError } = useGetCourseByIdQuery(courseId!);

  // Handle the loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle the error state or if data is unexpectedly missing
  if (isError || !data?.course) {
    // If the API call fails, we can't determine purchase status, so redirect
    return <Navigate to={`/course-detail/${courseId}`} replace />;
  }

  // Check the purchase status from the correct location
  // If true, render the child component (e.g., CourseProgress page)
  // If false, redirect the user back to the course detail page
  return data.course.purchased ? (
    <>{children}</>
  ) : (
    <Navigate to={`/course-detail/${courseId}`} replace />
  );
};

export default PurchaseCourseProtectedRoute;