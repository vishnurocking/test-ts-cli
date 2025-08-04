// ts-client/src/features/api/publicApi.ts  
// Public API with TypeScript support

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, Course } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file");
}

export const publicApi = createApi({
  reducerPath: "publicApi",
  tagTypes: ["PublicCourse", "PublicData"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // CRITICAL: Notice there is NO `credentials: "include"` here for public endpoints
  }),
  endpoints: (builder) => ({
    // Get published courses - TypeScript only
    getPublishedCourse: builder.query<ApiResponse<Course[]>, void>({
      query: () => ({
        url: "/course/published-courses",
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