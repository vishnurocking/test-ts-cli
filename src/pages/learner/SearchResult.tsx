// ts-client/src/pages/learner/SearchResult.tsx

import { Link } from "react-router-dom";
import type { Course } from "@/types";

interface SearchResultProps {
  course: Course;
}

const SearchResult = ({ course }: SearchResultProps): JSX.Element => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 py-4 gap-4">
      {/* Use course.courseId for the link */}
      <Link
        to={`/course-detail/${course.courseId}`}
        className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1"
      >
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle} // Use title for better alt text
          className="h-32 w-full md:w-56 object-cover rounded"
        />
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-lg md:text-xl">{course.courseTitle}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {course.subTitle}
          </p>

          {/* REMOVED: Instructor name is no longer available in this API response */}
          {/* 
          <p className="text-sm text-gray-700">
            Intructor: <span className="font-bold">{course.creator?.name}</span>{" "}
          </p> 
          */}

          {/* REMOVED: courseLevel is not part of the new schema */}
          {/* <Badge className="w-fit mt-2 md:mt-0">{course.courseLevel}</Badge> */}
        </div>
      </Link>
      <div className="mt-4 md:mt-0 md:text-right w-full md:w-auto">
        <h1 className="font-bold text-lg md:text-xl">₹{course.coursePrice}</h1>
      </div>
    </div>
  );
};

export default SearchResult;