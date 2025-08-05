// ts-client/src/features/api/publicApi.ts  
// Public API with TypeScript support

import { createApi } from "@reduxjs/toolkit/query/react";
import { createPublicBaseQuery } from "./baseApi";
import type { ApiResponse, Course } from "@/types";

export const publicApi = createApi({
  reducerPath: "publicApi",
  tagTypes: ["PublicCourse", "PublicData"],
  baseQuery: createPublicBaseQuery("/course"),
  endpoints: (builder) => ({
    // Get published courses - TypeScript only
    getPublishedCourse: builder.query<ApiResponse<Course[]>, void>({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<Course[]>) => {
        // TypeScript backend returns { success: true, data: [...] }
        return response;
      },
    }),

    // Keep these for future use
    getPublicCourses: builder.query<ApiResponse<Course[]>, void>({
      query: () => "/public/courses",
      providesTags: ["PublicCourse"],
    }),

    getCoursePreview: builder.query<ApiResponse<Course>, string>({
      query: (courseId) => `/public/course/${courseId}`,
      providesTags: ["PublicCourse"],
    }),

    // Placeholder for public data
    getAppInfo: builder.query<ApiResponse, void>({
      query: () => "/public/info",
      providesTags: ["PublicData"],
    }),
  }),
});

export const {
  useGetPublishedCourseQuery,
  // Keep old exports for compatibility
  useGetPublicCoursesQuery,
  useGetCoursePreviewQuery,
  useGetAppInfoQuery,
} = publicApi;