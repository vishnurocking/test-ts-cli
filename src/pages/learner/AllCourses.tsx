// ts-client/src/pages/learner/AllCourses.tsx

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetPublishedCourseQuery } from "@/features/api/publicApi";
import { useGetMyLearningQuery } from "@/features/api/purchaseApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap } from "lucide-react";
import Course from "./Course";
import type { Course as CourseType } from "@/types";

type Section = "all-courses" | "my-courses";

interface EmptyStateProps {
  section: Section;
  onSectionChange: (section: Section) => void;
}

const AllCourses = (): JSX.Element => {
  // URL search parameters for section control
  const [searchParams, setSearchParams] = useSearchParams();

  // State for toggle between sections - check URL params first
  const [currentSection, setCurrentSection] = useState<Section>(() => {
    const section = searchParams.get("section");
    return section === "my-courses" ? "my-courses" : "all-courses";
  });

  // Update URL when section changes
  const handleSectionChange = (newSection: Section): void => {
    setCurrentSection(newSection);
    if (newSection === "my-courses") {
      setSearchParams({ section: "my-courses" });
    } else {
      setSearchParams({});
    }
  };

  // Listen for URL parameter changes (e.g., from external navigation)
  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "my-courses" && currentSection !== "my-courses") {
      setCurrentSection("my-courses");
    } else if (!section && currentSection !== "all-courses") {
      setCurrentSection("all-courses");
    }
  }, [searchParams, currentSection]);

  // API hooks for both data sources
  const {
    data: publishedData,
    isLoading: publishedLoading,
    isError: publishedError,
  } = useGetPublishedCourseQuery();

  const {
    data: myLearningData,
    isLoading: myLearningLoading,
    isError: myLearningError,
  } = useGetMyLearningQuery();

  // Extract data from API responses
  const publishedCourses = publishedData?.courses || [];
  const myLearningCourses = myLearningData?.courses || [];

  // Create array of purchased course IDs for filtering
  const purchasedCourseIds = useMemo(
    () => myLearningCourses.map((course) => course.courseId),
    [myLearningCourses]
  );

  // Filter published courses to exclude already purchased ones
  const availableCourses = useMemo(
    () =>
      publishedCourses.filter(
        (course) => !purchasedCourseIds.includes(course.courseId)
      ),
    [publishedCourses, purchasedCourseIds]
  );

  // Determine loading and error states for current section
  const isLoading =
    currentSection === "all-courses" ? publishedLoading : myLearningLoading;
  const isError =
    currentSection === "all-courses" ? publishedError : myLearningError;

  // Get current courses to display
  const currentCourses =
    currentSection === "all-courses" ? availableCourses : myLearningCourses;
  const courseCount = currentCourses.length;

  // Handle error states
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto my-10 px-4">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Courses
          </h2>
          <p className="text-gray-600">
            Some error occurred while fetching courses. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-2">Courses</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore available courses or view your enrolled courses
        </p>
      </div>

      {/* Section Toggle Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={currentSection === "all-courses" ? "default" : "outline"}
          onClick={() => handleSectionChange("all-courses")}
          className="flex-1 py-3 max-w-xs"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          All Courses
          {!publishedLoading && (
            <span className="ml-2 text-sm">({availableCourses.length})</span>
          )}
        </Button>

        <Button
          variant={currentSection === "my-courses" ? "default" : "outline"}
          onClick={() => handleSectionChange("my-courses")}
          className="flex-1 py-3 max-w-xs"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          My Courses
          {!myLearningLoading && (
            <span className="ml-2 text-sm">({myLearningCourses.length})</span>
          )}
        </Button>
      </div>

      {/* Course Content */}
      <div className="my-5">
        {isLoading ? (
          <CoursesSkeleton />
        ) : courseCount === 0 ? (
          <EmptyState
            section={currentSection}
            onSectionChange={handleSectionChange}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentCourses.map((course) => (
              <Course key={course.courseId} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Empty state component for different sections
const EmptyState = ({ section, onSectionChange }: EmptyStateProps): JSX.Element => {
  if (section === "all-courses") {
    return (
      <div className="text-center py-16">
        <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Available Courses
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          All published courses have been enrolled. Check back later for new
          courses!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <GraduationCap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Enrolled Courses
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
        You haven't enrolled in any courses yet. Explore available courses to
        get started!
      </p>
      <Button
        variant="outline"
        onClick={() => onSectionChange("all-courses")}
        className="mt-2"
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Browse Courses
      </Button>
    </div>
  );
};

// Loading skeleton component
const CoursesSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
      >
        <Skeleton className="w-full h-36" />
        <div className="px-5 py-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="pt-2">
            <Skeleton className="h-6 w-1/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default AllCourses;