// ts-client/src/pages/learner/CourseDetail.tsx

import { Link, useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery } from "@/features/api/courseApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, BadgeInfo, BookOpen, GraduationCap } from "lucide-react";
import ReactPlayer from "react-player";
import LoadingSpinner from "@/components/LoadingSpinner";
import BuyCourseButton from "@/components/BuyCourseButton";
import { toast } from "sonner";

const CourseDetail = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Get the `refetch` function from the hook
  const { data, isLoading, isError, refetch } = useGetCourseByIdQuery(courseId!);

  // ENHANCED: Purchase success handler with navigation options
  const handlePurchaseSuccess = (): void => {
    // Manually trigger a refetch of the course data.
    // This will update the `purchased` flag and re-render the component.
    refetch();

    // Show success message
    toast.success(
      "🎉 Course purchased successfully! Starting your learning journey..."
    );

    // Navigate to course progress after short delay
    setTimeout(() => {
      navigate(`/course-progress/${courseId}`);
    }, 2000);

    // Show additional info toast
    setTimeout(() => {
      toast.info(
        "Visit 'My Courses' anytime to see all your enrolled courses."
      );
    }, 2500);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data?.course) return <h1>Failed to load course details.</h1>;

  const course = data.course;
  const purchased = course.purchased;

  const previewLecture = course.lectures?.find((lec) => lec.videoUrl);

  const handleGoToCourse = (): void => {
    navigate(`/course-progress/${courseId}`);
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course.courseTitle}
          </h1>
          <p className="text-base md:text-lg">{course.subTitle}</p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>
              Last updated {new Date(course.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* ADDED: Quick navigation links */}
          <div className="flex items-center gap-4 mt-4">
            <Link
              to="/courses"
              className="text-sm text-blue-300 hover:text-blue-100 flex items-center gap-1"
            >
              <BookOpen size={14} />
              All Courses
            </Link>
            <Link
              to="/courses?section=my-courses"
              className="text-sm text-green-300 hover:text-green-100 flex items-center gap-1"
            >
              <GraduationCap size={14} />
              My Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-2/3 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <div
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.lectures.length} lectures visible to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <PlayCircle size={14} />
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                {previewLecture?.videoUrl ? (
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    url={previewLecture.videoUrl}
                    controls={true}
                    light={course.courseThumbnail}
                  />
                ) : (
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h1 className="truncate">
                {previewLecture?.lectureTitle || "Course Preview"}
              </h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">
                Price: ₹{course.coursePrice}
              </h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {/* ENHANCED: Purchase button section with better messaging */}
              {purchased ? (
                <div className="w-full space-y-2">
                  <Button onClick={handleGoToCourse} className="w-full">
                    Continue Learning
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/courses?section=my-courses")}
                    className="w-full"
                    size="sm"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    View All My Courses
                  </Button>
                </div>
              ) : (
                // Pass the callback function as the `onSuccess` prop
                <BuyCourseButton
                  courseId={courseId!}
                  onSuccess={handlePurchaseSuccess}
                />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;