// ts-client/src/pages/learner/CourseProgress.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Lecture } from "@/types";

const CourseProgress = (): JSX.Element => {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId!;
  
  // The 'refetch' function is no longer needed due to our tag-based refetching
  const { data, isLoading, isError } = useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  // This useEffect can be simplified, as refetching is now automatic.
  useEffect(() => {
    if (completedSuccess) {
      toast.success(markCompleteData?.message || "Course marked as complete");
    }
    if (inCompletedSuccess) {
      toast.success(markInCompleteData?.message || "Course marked as incomplete");
    }
  }, [
    completedSuccess,
    inCompletedSuccess,
    markCompleteData,
    markInCompleteData,
  ]);

  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data?.data) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed, progressPercentage } = data.data;
  const { courseTitle, lectures } = courseDetails;

  const initialLecture = currentLecture || (lectures && lectures[0]);

  // Calculate progress statistics
  const totalLectures = lectures?.length || 0;
  const completedCount = Object.values(progress).filter(Boolean).length;
  const remainingCount = totalLectures - completedCount;
  const displayPercentage = progressPercentage || Math.round((completedCount / totalLectures) * 100) || 0;

  // Check for a key in the progress object
  const isLectureCompleted = (lectureId: string): boolean => {
    // Backend sends boolean directly: progress[lectureId] = true/false
    return progress[lectureId] === true;
  };

  const handleLectureProgress = async (lectureId: string): Promise<void> => {
    // Only update progress if it's not already marked as completed
    if (!isLectureCompleted(lectureId)) {
      try {
        await updateLectureProgress({ courseId, lectureId });
        // Show success notification
        toast.success("Lecture completed! 🎉");
      } catch (error) {
        toast.error("Failed to save progress");
        console.error("Progress update error:", error);
      }
    }
  };

  const handleMarkComplete = async (lectureId: string): Promise<void> => {
    if (!isLectureCompleted(lectureId)) {
      try {
        await updateLectureProgress({ courseId, lectureId });
        toast.success("Lecture marked as complete! ✓");
      } catch (error) {
        toast.error("Failed to mark as complete");
        console.error("Mark complete error:", error);
      }
    }
  };

  const handleSelectLecture = (lecture: Lecture): void => {
    setCurrentLecture(lecture);
    // Use lectureId
    handleLectureProgress(lecture.lectureId);
  };

  const handleCompleteCourse = (): void => {
    completeCourse(courseId);
  };

  const handleInCompleteCourse = (): void => {
    inCompleteCourse(courseId);
  };

  // Guard against case where there are no lectures
  if (!initialLecture) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <p className="mt-4">This course does not have any lectures yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      {/* Course Completion Celebration */}
      {completed && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="text-yellow-500 dark:text-yellow-400 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                🎉 Congratulations! Course Completed!
              </h3>
              <p className="text-green-600 dark:text-green-300">
                You've successfully completed all {totalLectures} lectures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Statistics Panel */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800">
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedCount}</h3>
          <p className="text-blue-500 dark:text-blue-300 text-sm">Completed</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300">{remainingCount}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Remaining</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800">
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{displayPercentage}%</h3>
          <p className="text-green-500 dark:text-green-300 text-sm">Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Progress</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{completedCount}/{totalLectures} lectures</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          {displayPercentage}% Complete
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            <video
              // Use lectureId
              key={currentLecture?.lectureId || initialLecture.lectureId}
              src={currentLecture?.videoUrl || initialLecture.videoUrl}
              controls
              autoPlay
              className="w-full h-auto md:rounded-lg"
              onPlay={() =>
                // Use lectureId
                handleLectureProgress(
                  currentLecture?.lectureId || initialLecture.lectureId
                )
              }
            />
          </div>
          <div className="mt-2 ">
            <h3 className="font-medium text-lg">
              {/* Use lectureId for findIndex */}
              {`Lecture ${
                lectures.findIndex(
                  (lec) =>
                    lec.lectureId ===
                    (currentLecture?.lectureId || initialLecture.lectureId)
                ) + 1
              } : ${
                currentLecture?.lectureTitle || initialLecture.lectureTitle
              }`}
            </h3>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4 text-gray-900 dark:text-gray-100">Course Lectures</h2>
          <div className="flex-1 overflow-y-auto">
            {lectures.map((lecture) => (
              <Card
                // Use lectureId for key and comparison
                key={lecture.lectureId}
                className={`mb-3 hover:cursor-pointer transition-all duration-200 ${
                  lecture.lectureId === currentLecture?.lectureId
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-md" // Currently playing
                    : isLectureCompleted(lecture.lectureId)
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"         // Completed
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" // Not started
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Enhanced lecture status icons */}
                      {isLectureCompleted(lecture.lectureId) ? (
                        <CheckCircle2 size={24} className="text-green-500 dark:text-green-400 mr-3" />
                      ) : (
                        <CirclePlay size={24} className="text-gray-500 dark:text-gray-400 mr-3" />
                      )}
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {lecture.lectureTitle}
                        </CardTitle>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      {isLectureCompleted(lecture.lectureId) ? (
                        <Badge variant="outline" className="bg-green-200 dark:bg-green-900/40 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600">
                          ✓ Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                          Not Started
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Mark as Complete Button */}
                  <div className="mt-3 flex justify-end">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleMarkComplete(lecture.lectureId);
                      }}
                      variant={isLectureCompleted(lecture.lectureId) ? "outline" : "default"}
                      size="sm"
                      disabled={isLectureCompleted(lecture.lectureId)}
                    >
                      {isLectureCompleted(lecture.lectureId) ? "Completed ✓" : "Mark as Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;