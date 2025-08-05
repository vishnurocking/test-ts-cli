// ts-client/src/features/api/courseProgressApi.ts
// Course progress API with TypeScript support

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseApi";
import type { 
  UpdateProgressRequest,
  ApiResponse,
  CourseProgress
} from "@/types";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi", 
  // STEP 1: Define the tag type for our progress data
  tagTypes: ["CourseProgress"],
  baseQuery: createBaseQuery("/progress"),
  endpoints: (builder) => ({
    getCourseProgress: builder.query<ApiResponse<CourseProgress>, string>({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      // STEP 2: Provide a specific tag for this course's progress
      providesTags: (result, error, courseId) => [
        { type: "CourseProgress", id: courseId },
      ],
    }),

    updateLectureProgress: builder.mutation<ApiResponse, { courseId: string; lectureId: string }>({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method: "POST",
      }),
      // STEP 3: Invalidate the tag on mutation to trigger a refetch
      invalidatesTags: (result, error, { courseId }) => [
        { type: "CourseProgress", id: courseId },
      ],
    }),

    completeCourse: builder.mutation<ApiResponse, string>({
      query: (courseId) => ({
        url: `/${courseId}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: "CourseProgress", id: courseId },
      ],
    }),

    inCompleteCourse: builder.mutation<ApiResponse, string>({
      query: (courseId) => ({
        url: `/${courseId}/incomplete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: "CourseProgress", id: courseId },
      ],
    }),

    // Keep old method for compatibility
    updateCourseProgress: builder.mutation<ApiResponse, UpdateProgressRequest>({
      query: ({ courseId, ...progressData }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["CourseProgress"],
    }),
  }),
});

export const {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation,
  // Keep old export for compatibility
  useUpdateCourseProgressMutation,
} = courseProgressApi;