// ts-client/src/pages/learner/MyLearning.tsx

import Course from "./Course";
import { useGetMyLearningQuery } from "@/features/api/purchaseApi";
import { Skeleton } from "@/components/ui/skeleton";

const MyLearning = (): JSX.Element => {
  // Use the dedicated hook for this page
  const { data, isLoading } = useGetMyLearningQuery();

  // The data now comes directly from our new endpoint
  const myLearning = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <h1 className="font-bold text-2xl">MY LEARNING</h1>
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : myLearning.length === 0 ? (
          <p>You haven't enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Map over the new data source and use the correct key */}
            {/* The `course` object here is actually the purchase item, which has */}
            {/* all the denormalized data we need (courseTitle, courseThumbnail, etc.) */}
            {myLearning.map((course) => (
              <Course key={course.courseId} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

// Skeleton component remains the same, but we'll import Skeleton for it
const MyLearningSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    ))}
  </div>
);