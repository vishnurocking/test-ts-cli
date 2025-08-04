// ts-client/src/pages/admin/lecture/LectureTab.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  useGetCourseByIdQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import axios, { AxiosResponse } from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Lecture, Course } from "@/types";

interface VideoInfo {
  videoUrl: string;
  publicId: string;
}

interface CloudinaryVideoResponse {
  secure_url: string;
  public_id: string;
}

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = "lms_unsigned_videos";

const LectureTab = (): JSX.Element => {
  const params = useParams<{ courseId: string; lectureId: string }>();
  const { courseId, lectureId } = params;
  const navigate = useNavigate();

  const { data: courseData, isLoading: isCourseLoading } =
    useGetCourseByIdQuery(courseId!);

  const [lectureTitle, setLectureTitle] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [editLecture, { isLoading: isEditing, isSuccess, error }] =
    useEditLectureMutation();
  const [removeLecture, { isLoading: isRemoving }] = useRemoveLectureMutation();

  const lecture: Lecture | undefined = courseData?.course?.lectures.find(
    (l: Lecture) => l.lectureId === lectureId
  );

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle || "");
      setIsFree(lecture.isPreviewFree || false);
      if (lecture.videoUrl) {
        setVideoInfo({
          videoUrl: lecture.videoUrl,
          publicId: lecture.publicId || "",
        });
      }
    }
  }, [lecture]);

  const fileChangeHandler = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

      const res: AxiosResponse<CloudinaryVideoResponse> = await axios.post(
        uploadUrl,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: ({ loaded, total }: UploadProgressEvent) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        }
      );

      if (res.data.secure_url) {
        setVideoInfo({
          videoUrl: res.data.secure_url,
          publicId: res.data.public_id,
        });
        toast.success("Video uploaded successfully!");
      }
    } catch (err: any) {
      console.error("Video upload failed:", err.response?.data);
      toast.error(err.response?.data?.error?.message || "Video upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const editLectureHandler = async (): Promise<void> => {
    await editLecture({
      lectureTitle,
      videoInfo,
      isPreviewFree: isFree,
      courseId: courseId!,
      lectureId: lectureId!,
    });
  };

  const removeLectureHandler = async (): Promise<void> => {
    try {
      const result = await removeLecture({ courseId: courseId!, lectureId: lectureId! }).unwrap();
      toast.success(result.message);
      navigate(`/admin/course/${courseId}/lecture`);
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to remove lecture.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Lecture updated successfully!");
    }
    if (error) {
      toast.error((error as any).data?.message || "Failed to update lecture");
    }
  }, [isSuccess, error]);

  if (isCourseLoading) return <h1>Loading...</h1>;
  if (!lecture) return <h1>Lecture not found.</h1>;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="pt-4 md:pt-0">
          <Button
            disabled={isRemoving || isUploading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing...
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        {videoInfo?.videoUrl && (
          <div className="my-4">
            <Label>Current Video</Label>
            <video
              src={videoInfo.videoUrl}
              controls
              className="w-full rounded-md mt-2"
            />
          </div>
        )}
        <div>
          <Label>
            {videoInfo?.videoUrl
              ? "Upload a new video to replace"
              : "Upload Video"}
          </Label>
          <Input
            type="file"
            accept="video/*"
            disabled={isUploading}
            onChange={fileChangeHandler}
            className="w-fit"
          />
        </div>
        {isUploading && (
          <div className="my-4 space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-gray-500">{uploadProgress}% uploaded</p>
          </div>
        )}
        <div className="flex items-center space-x-2 my-5">
          <Switch
            checked={isFree}
            onCheckedChange={setIsFree}
            id="preview-switch"
          />
          <Label htmlFor="preview-switch">
            Make this lecture a free preview
          </Label>
        </div>
        <div>
          <Button
            disabled={isEditing || isUploading}
            onClick={editLectureHandler}
          >
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;