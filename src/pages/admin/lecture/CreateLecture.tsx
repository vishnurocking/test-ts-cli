// ts-client/src/pages/admin/lecture/CreateLecture.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";
import type { Lecture as LectureType } from "@/types";

const CreateLecture = (): JSX.Element => {
  const [lectureTitle, setLectureTitle] = useState<string>("");
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId!;
  const navigate = useNavigate();

  const [createLecture, { isLoading: isCreating }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
  } = useGetCourseLectureQuery(courseId);

  const createLectureHandler = async (): Promise<void> => {
    if (!lectureTitle.trim()) {
      toast.error("Lecture title cannot be empty.");
      return;
    }
    try {
      const result = await createLecture({ lectureTitle, courseId }).unwrap();
      toast.success(result.message || "Lecture created successfully!");
      setLectureTitle(""); // Clear the input on success
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to create lecture.");
    }
  };

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">Manage Your Course Lectures</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add new lectures below. Click on any existing lecture to edit it.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>New Lecture Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLectureTitle(e.target.value)}
            placeholder="e.g., Introduction to the Course"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to Course Details
          </Button>
          <Button disabled={isCreating} onClick={createLectureHandler}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Lecture"
            )}
          </Button>
        </div>
        <div className="mt-10 border-t pt-6">
          <h2 className="font-semibold text-lg mb-4">Existing Lectures</h2>
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p className="text-red-500">Failed to load lectures.</p>
          ) : lectureData?.lectures.length === 0 ? (
            <p>No lectures have been added to this course yet.</p>
          ) : (
            lectureData?.lectures.map((lecture: LectureType, index: number) => (
              <Lecture
                key={lecture.lectureId}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;