// ts-client/src/pages/learner/Course.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { Course as CourseType } from "@/types";

interface CourseProps {
  course: CourseType;
}

const Course = ({ course }: CourseProps): JSX.Element => {
  // The link now uses `course.courseId` which is the new primary key from DynamoDB
  return (
    <Link to={`/course-detail/${course.courseId}`}>
      <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="relative">
          <img
            src={course.courseThumbnail}
            alt={course.courseTitle} // Use courseTitle for better alt text
            className="w-full h-36 object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="hover:underline font-bold text-lg truncate h-6">
            {course.courseTitle}
          </h1>

          {/* --- FIX THIS SECTION HAS BEEN REMOVED --- */}
          {/* The creator's full details are no longer available in this API response. */}
          {/* 
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={course.creator?.photoUrl || "https://github.com/shadcn.png"} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className="font-medium text-sm">{course.creator?.name}</h1>
            </div>
            <Badge className={'bg-blue-600 text-white px-2 py-1 text-xs rounded-full'}>
              {course.courseLevel}
            </Badge>
          </div>
          */}

          <div className="text-lg font-bold pt-2">
            {/* The coursePrice field is still available */}
            <span>₹{course.coursePrice}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;