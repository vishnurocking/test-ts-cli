// ts-client/src/features/api/userProgressApi.ts
// User progress API with TypeScript support

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { 
  ApiResponse, 
  UserProgress,
  UpdateLessonProgressRequest
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file");
}

export const userProgressApi = createApi({
  reducerPath: "userProgressApi",
  tagTypes: ["UserProgress", "LessonProgress"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/userprogress`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Get user's overall progress summary
    getUserProgress: builder.query<ApiResponse<UserProgress>, void>({
      query: () => "/",
      providesTags: ["UserProgress"],
      transformResponse: (response: any) => response.progress,
    }),

    // Get progress for a specific lesson
    getLessonProgress: builder.query<ApiResponse<UserProgress>, string>({
      query: (lessonId) => `/lesson/${lessonId}`,
      providesTags: (result, error, lessonId) => [
        { type: "LessonProgress", id: lessonId },
      ],
      transformResponse: (response: any) => response.progress,
    }),

    // Start a lesson (creates progress record)
    startLesson: builder.mutation<ApiResponse, { lessonId: string; unitId: string }>({
      query: ({ lessonId, unitId }) => ({
        url: `/lesson/${lessonId}/start`,
        method: "POST",
        body: { unitId },
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        "UserProgress",
        { type: "LessonProgress", id: lessonId },
      ],
    }),

    // Complete a lesson with exercise results
    completeLesson: builder.mutation<ApiResponse, { lessonId: string; exerciseResults: any; timeSpent: number }>({
      query: ({ lessonId, exerciseResults, timeSpent }) => ({
        url: `/lesson/${lessonId}/complete`,
        method: "POST",
        body: { exerciseResults, timeSpent },
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        "UserProgress",
        { type: "LessonProgress", id: lessonId },
      ],
    }),

    // Get progress for a specific unit
    getUnitProgress: builder.query<ApiResponse<{ unitId: string; lessons: UserProgress[] }>, string>({
      query: (unitId) => `/unit/${unitId}`,
      providesTags: (result, error, unitId) => [
        { type: "UserProgress", id: `unit-${unitId}` },
      ],
      transformResponse: (response: any) => ({
        unitId: response.unitId,
        lessons: response.lessons || [],
      }),
    }),

    // Keep old methods for compatibility
    updateLessonProgress: builder.mutation<ApiResponse, UpdateLessonProgressRequest>({
      query: ({ lessonId, ...progressData }) => ({
        url: `/${lessonId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["UserProgress", "LessonProgress"],
    }),

    getUserStats: builder.query<ApiResponse<any>, void>({
      query: () => "/stats",
      providesTags: ["UserProgress"],
    }),
  }),
});

export const {
  useGetUserProgressQuery,
  useGetLessonProgressQuery,
  useStartLessonMutation,
  useCompleteLessonMutation,
  useGetUnitProgressQuery,
  // Keep old exports for compatibility
  useUpdateLessonProgressMutation,
  useGetUserStatsQuery,
} = userProgressApi;