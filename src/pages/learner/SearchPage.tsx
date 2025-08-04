// ts-client/src/pages/learner/SearchPage.tsx

import { useState } from "react";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types";

const SearchPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || ""; // Add a fallback for empty query
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortByPrice, setSortByPrice] = useState<string>("");

  const { data, isLoading } = useGetSearchCourseQuery({
    searchQuery: query,
    categories: selectedCategories,
    sortByPrice,
  });

  const isEmpty = !isLoading && (data?.courses?.length === 0);

  const handleFilterChange = (categories: string[], price: string): void => {
    setSelectedCategories(categories);
    setSortByPrice(price);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="my-6">
        <h1 className="font-bold text-xl md:text-2xl">Results for "{query}"</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {/* A slightly clearer message */}
          {isLoading
            ? "Searching..."
            : `${data?.courses?.length || 0} results found`}
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <Filter handleFilterChange={handleFilterChange} />
        <div className="flex-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <CourseSkeleton key={idx} />
            ))
          ) : isEmpty ? (
            <CourseNotFound />
          ) : (
            data?.courses?.map((course: Course) => (
              // Use course.courseId for the key
              <SearchResult key={course.courseId} course={course} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

// No changes needed for CourseNotFound
const CourseNotFound = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-center min-h-32 dark:bg-gray-900 p-6">
      <AlertCircle className="text-red-500 h-16 w-16 mb-4" />
      <h1 className="font-bold text-2xl md:text-4xl text-gray-800 dark:text-gray-200 mb-2">
        No Courses Found
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
        Try adjusting your search or filter settings.
      </p>
      <Link to="/" className="italic">
        <Button variant="link">Browse All Courses</Button>
      </Link>
    </div>
  );
};

// No changes needed for CourseSkeleton
const CourseSkeleton = (): JSX.Element => {
  return (
    <div className="flex flex-col md:flex-row justify-between border-b border-gray-300 py-4 gap-4">
      <div className="h-32 w-full md:w-56">
        <Skeleton className="h-full w-full object-cover rounded" />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-20 mt-2" />
      </div>
      <div className="mt-4 md:mt-0">
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
};