// ts-client/src/pages/learner/Courses.tsx

import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/publicApi";

const Courses = (): JSX.Element => {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();

  if (isError) return <h1>Some error occurred while fetching courses.</h1>;

  return (
    <div className="bg-gray-50 dark:bg-[#141414]">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="font-bold text-3xl text-center mb-10">Our Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            : data?.courses &&
              data.courses.map((course) => (
                // Using `course.courseId` as the key is a React best practice
                <Course key={course.courseId} course={course} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;

// The CourseSkeleton component should also be updated to reflect the new, simpler card design.
const CourseSkeleton = (): JSX.Element => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <Skeleton className="w-full h-36" />
      <div className="px-5 py-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="pt-2">
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    </div>
  );
};