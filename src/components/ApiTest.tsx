// ts-client/src/components/ApiTest.tsx

import {
  useGetUnitsQuery,
  useGetLessonQuery,
} from "@/features/api/freeLessonsApi";
import { useGetUserProgressQuery } from "@/features/api/userProgressApi";

const ApiTest = (): JSX.Element => {
  // Test the new API hooks
  const {
    data: units,
    isLoading: unitsLoading,
    error: unitsError,
  } = useGetUnitsQuery();
  const { data: lesson, isLoading: lessonLoading } = useGetLessonQuery("1.1");
  const { data: progress, isLoading: progressLoading } =
    useGetUserProgressQuery();

  if (unitsLoading || lessonLoading || progressLoading) {
    return <div className="p-4">Loading API test data...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Language Learning API Test</h2>

      {/* Units Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Units API Test</h3>
        {unitsError ? (
          <div className="text-red-500">Error: {(unitsError as any).message}</div>
        ) : (
          <div>
            <p>Found {units?.length || 0} units</p>
            {units?.slice(0, 2).map((unit) => (
              <div key={unit.unitId} className="ml-4">
                - Unit {unit.unitId}: {unit.totalLessons} lessons
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">
          Lesson API Test (Lesson 1.1)
        </h3>
        {lesson ? (
          <div>
            <p>
              <strong>Title:</strong> {lesson.title}
            </p>
            <p>
              <strong>Hindi Title:</strong> {lesson.titleHindi}
            </p>
            <p>
              <strong>Vocabulary:</strong> {lesson.vocabulary?.length || 0}{" "}
              items
            </p>
            <p>
              <strong>Exercises:</strong> {lesson.exercises?.length || 0}{" "}
              exercises
            </p>
          </div>
        ) : (
          <div className="text-yellow-600">No lesson data found</div>
        )}
      </div>

      {/* Progress Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Progress API Test</h3>
        {progress ? (
          <div>
            <p>
              <strong>Completed Lessons:</strong>{" "}
              {progress.totalLessonsCompleted || 0}
            </p>
            <p>
              <strong>Total Time:</strong>{" "}
              {Math.round((progress.totalTimeSpent || 0) / 60)} minutes
            </p>
            <p>
              <strong>Average Accuracy:</strong> {progress.averageAccuracy || 0}
              %
            </p>
          </div>
        ) : (
          <div className="text-yellow-600">No progress data found</div>
        )}
      </div>

      <div className="text-green-600 font-semibold">
        ✅ If you see data above, API integration is working!
      </div>
    </div>
  );
};

export default ApiTest;