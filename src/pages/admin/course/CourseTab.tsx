// ts-client/src/pages/admin/course/CourseTab.tsx

import RichTextEditor from "@/components/RichTextEditor";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/types";

interface CourseInput {
  courseTitle: string;
  subTitle: string;
  category: string;
  coursePrice: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = "lms_unsigned_preset";

const CourseTab = (): JSX.Element => {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId!;
  const navigate = useNavigate();

  const { data: courseByIdData, isLoading: courseByIdLoading } =
    useGetCourseByIdQuery(courseId);
  const [publishCourse, { isLoading: isPublishing }] =
    usePublishCourseMutation();
  const [
    editCourse,
    { data: editData, isLoading: isEditing, isSuccess, error },
  ] = useEditCourseMutation();

  const [input, setInput] = useState<CourseInput>({
    courseTitle: "",
    subTitle: "",
    category: "",
    coursePrice: "",
  });
  const [description, setDescription] = useState<string>("");
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        category: course.category || "",
        coursePrice: course.coursePrice || "",
      });
      setDescription(course.description || "");
      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);
      }
    }
  }, [courseByIdData]);

  const changeEventHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const selectCategory = (value: string): void => {
    setInput((prev) => ({ ...prev, category: value }));
  };

  const selectThumbnail = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseThumbnail(file);
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result as string);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async (): Promise<void> => {
    let courseUpdatePayload: any = {
      ...input,
      description,
    };

    if (courseThumbnail) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const formDataForCloudinary = new FormData();
        formDataForCloudinary.append("file", courseThumbnail);
        formDataForCloudinary.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const res: AxiosResponse<CloudinaryResponse> = await axios.post(
          uploadUrl,
          formDataForCloudinary,
          {
            onUploadProgress: ({ loaded, total }: UploadProgressEvent) => {
              setUploadProgress(Math.round((loaded * 100) / total));
            },
          }
        );

        courseUpdatePayload.courseThumbnail = res.data.secure_url;
        courseUpdatePayload.courseThumbnailPublicId = res.data.public_id;
      } catch (err) {
        console.error("Upload to Cloudinary failed:", err);
        toast.error(
          "Thumbnail upload failed. Please check your upload preset configuration."
        );
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    await editCourse({ courseData: courseUpdatePayload, courseId });
  };

  const publishStatusHandler = async (action: boolean): Promise<void> => {
    try {
      const response = await publishCourse({
        courseId,
        query: action,
      }).unwrap();
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update publish status");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(editData?.message || "Course updated successfully.");
    }
    if (error) {
      toast.error((error as any)?.data?.message || "Failed to update course.");
    }
  }, [isSuccess, error, editData]);

  if (courseByIdLoading) return <h1>Loading Course Details...</h1>;
  const course: Course = courseByIdData?.course;
  if (!course) return <h1>Course not found.</h1>;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between">
        <div>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Make changes to your course here. Click save when you're done.
          </CardDescription>
        </div>
        <div className="space-x-2 pt-4 md:pt-0">
          <Button
            disabled={
              isPublishing || isUploading || course.lectures.length === 0
            }
            variant="outline"
            onClick={() => publishStatusHandler(!course.isPublished)}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : course.isPublished ? (
              "Unpublish"
            ) : (
              "Publish"
            )}
          </Button>
          <Button variant="destructive" disabled>
            Remove Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="e.g., The Ultimate Guide to React"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="e.g., From beginner to advanced in 2 months"
            />
          </div>
          <div>
            <Label>Description</Label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <Label>Category</Label>
              <Select value={input.category} onValueChange={selectCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Super Learning">
                      Super Learning
                    </SelectItem>
                    <SelectItem value="Vocabulary Builder">
                      Vocabulary Builder
                    </SelectItem>
                    <SelectItem value="Phonetics">Phonetics</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price in (INR)</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                placeholder="e.g., 1999"
                className="w-[180px]"
              />
            </div>
          </div>
          <div>
            <Label>Course Thumbnail</Label>
            <Input
              type="file"
              onChange={selectThumbnail}
              accept="image/*"
              className="w-fit"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="my-2 space-y-1">
                <Progress value={uploadProgress} className="w-full md:w-1/2" />
                <p className="text-sm text-gray-500">
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}
            {previewThumbnail && (
              <img
                src={previewThumbnail}
                className="h-48 my-2 rounded-md object-cover"
                alt="Course Thumbnail Preview"
              />
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => navigate("/admin/course")} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isEditing || isUploading}
              onClick={updateCourseHandler}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;