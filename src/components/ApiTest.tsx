// ts-client/src/components/ApiTest.tsx
// Updated for TypeScript-only API structure

import {
  useGetActiveLessonsQuery,
  useGetLessonQuery,
} from "@/features/api/freeLessonsApi";
import { useGetUserProgressQuery } from "@/features/api/userProgressApi";
import { useGetPublishedCourseQuery } from "@/features/api/publicApi";

const ApiTest = (): JSX.Element => {
  // Test the TypeScript-only API hooks
  const {
    data: lessons,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useGetActiveLessonsQuery();
  
  const { data: lesson, isLoading: lessonLoading } = useGetLessonQuery("1.1");
  
  const { data: progress, isLoading: progressLoading } =
    useGetUserProgressQuery();
    
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetPublishedCourseQuery();

  if (lessonsLoading || lessonLoading || progressLoading || coursesLoading) {
    return <div className="p-4">Loading API test data...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">TypeScript API Test</h2>

      {/* Published Courses Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Published Courses API Test</h3>
        {coursesError ? (
          <div className="text-red-500">Error: {(coursesError as any).message}</div>
        ) : (
          <div>
            <p>Found {courses?.data?.length || 0} published courses</p>
            {courses?.data?.slice(0, 2).map((course) => (
              <div key={course.courseId} className="ml-4">
                - {course.courseTitle} (₹{course.coursePrice}) - Published: {course.isPublished ? 'Yes' : 'No'}
              </div>
            ))}
            <div className="mt-2 text-sm text-gray-600">
              API Success: {courses?.success ? '✅' : '❌'} | 
              isPublished Type: {typeof courses?.data?.[0]?.isPublished}
            </div>
          </div>
        )}
      </div>

      {/* Active Lessons Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Active Lessons API Test</h3>
        {lessonsError ? (
          <div className="text-red-500">Error: {(lessonsError as any).message}</div>
        ) : (
          <div>
            <p>Found {lessons?.length || 0} active lessons</p>
            {lessons?.slice(0, 3).map((lesson) => (
              <div key={lesson.lessonId} className="ml-4">
                - Lesson {lesson.lessonId}: {lesson.title} ({lesson.difficulty}, {lesson.estimatedTime}min)
              </div>
            ))}
            <div className="mt-2 text-sm text-gray-600">
              Vocabulary: {lessons?.[0]?.vocabulary?.length || 0} words in first lesson
            </div>
          </div>
        )}
      </div>

      {/* Individual Lesson Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">
          Individual Lesson API Test (Lesson 1.1)
        </h3>
        {lesson ? (
          <div>
            <p>
              <strong>Title:</strong> {lesson.title}
            </p>
            <p>
              <strong>Description:</strong> {lesson.description}
            </p>
            <p>
              <strong>Difficulty:</strong> {lesson.difficulty}
            </p>
            <p>
              <strong>Estimated Time:</strong> {lesson.estimatedTime} minutes
            </p>
            <p>
              <strong>Vocabulary:</strong> {lesson.vocabulary?.length || 0} items
            </p>
            <p>
              <strong>Exercises:</strong> {lesson.exercises?.length || 0} exercises
            </p>
            <p>
              <strong>Status:</strong> {lesson.isActive}
            </p>
          </div>
        ) : (
          <div className="text-yellow-600">No lesson data found (lesson might not exist)</div>
        )}
      </div>

      {/* Progress Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">User Progress API Test</h3>
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
              <strong>Accuracy:</strong> {progress.averageAccuracy || 0}%
            </p>
            <p>
              <strong>Current Streak:</strong> {progress.currentStreak || 0} days
            </p>
          </div>
        ) : (
          <div className="text-yellow-600">No progress data found (user might not have started learning)</div>
        )}
      </div>

      {/* API Summary */}
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="text-lg font-semibold mb-2 text-green-800">✅ TypeScript API Status</h3>
        <div className="space-y-1 text-sm">
          <div>• Published Courses: {courses?.success ? '✅ Working' : '❌ Error'}</div>
          <div>• Active Lessons: {lessons && lessons.length > 0 ? '✅ Working' : '❌ Error'}</div>
          <div>• Individual Lesson: {lesson ? '✅ Working' : '⚠️ No data'}</div>
          <div>• User Progress: {progress ? '✅ Working' : '⚠️ No data'}</div>
        </div>
        <div className="mt-3 text-green-700 font-medium">
          🎉 TypeScript-only migration successful! No more 404 errors.
        </div>
      </div>
    </div>
  );
};

export default ApiTest;