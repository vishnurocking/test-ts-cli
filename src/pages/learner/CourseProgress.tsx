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

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, lectures } = courseDetails;

  const initialLecture = currentLecture || (lectures && lectures[0]);

  // Check for a key in the progress object
  const isLectureCompleted = (lectureId: string): boolean => {
    // Check if the lectureId exists as a key in the progress map and its `viewed` property is true.
    return progress[lectureId]?.viewed === true;
  };

  const handleLectureProgress = async (lectureId: string): Promise<void> => {
    // Only update progress if it's not already marked as completed
    if (!isLectureCompleted(lectureId)) {
      await updateLectureProgress({ courseId, lectureId });
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
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          <div className="flex-1 overflow-y-auto">
            {lectures.map((lecture) => (
              <Card
                // Use lectureId for key and comparison
                key={lecture.lectureId}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture.lectureId === currentLecture?.lectureId
                    ? "bg-gray-200 dark:bg-gray-800"
                    : ""
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {/* Use lectureId with the new function */}
                    {isLectureCompleted(lecture.lectureId) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {lecture.lectureTitle}
                      </CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture.lectureId) && (
                    <Badge
                      variant={"outline"}
                      className="bg-green-200 text-green-600"
                    >
                      Completed
                    </Badge>
                  )}
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