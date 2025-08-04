// ts-client/src/features/api/freeLessonsApi.ts
// Free lessons API with TypeScript support

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { 
  ApiResponse, 
  FreeLesson,
  LessonSearchParams
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file");
}

export const freeLessonsApi = createApi({
  reducerPath: "freeLessonsApi",
  tagTypes: ["Units", "Lessons", "LessonDetail"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/freelessons`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Get all learning units - matching JS version
    getUnits: builder.query<ApiResponse<any>, void>({
      query: () => "/units",
      providesTags: ["Units"],
      transformResponse: (response: any) => response.units || [],
    }),

    // Get lessons for a specific unit
    getUnitLessons: builder.query<ApiResponse<{ unitId: string; lessons: FreeLesson[] }>, string>({
      query: (unitId) => `/unit/${unitId}`,
      providesTags: (result, error, unitId) => [
        { type: "Lessons", id: unitId },
      ],
      transformResponse: (response: any) => ({
        unitId: response.unitId,
        lessons: response.lessons || [],
      }),
    }),

    // Get detailed lesson content with exercises - matching JS version
    getLesson: builder.query<ApiResponse<FreeLesson>, string>({
      query: (lessonId) => `/lesson/${lessonId}`,
      providesTags: (result, error, lessonId) => [
        { type: "LessonDetail", id: lessonId },
      ],
      transformResponse: (response: any) => response.lesson,
    }),

    // Prefetch next lesson (for smooth navigation)
    prefetchLesson: builder.query<ApiResponse<FreeLesson>, string>({
      query: (lessonId) => `/lesson/${lessonId}`,
      transformResponse: (response: any) => response.lesson,
    }),

    // Keep these for backwards compatibility
    getFreeLesson: builder.query<ApiResponse<FreeLesson>, string>({
      query: (lessonId) => `/${lessonId}`,
      providesTags: ["LessonDetail"],
    }),

    getAllUnits: builder.query<ApiResponse<any[]>, void>({
      query: () => "/units",
      providesTags: ["Units"],
    }),

    searchLessons: builder.query<ApiResponse<FreeLesson[]>, LessonSearchParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.unitId) queryParams.append('unitId', params.unitId);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        
        return `/search?${queryParams.toString()}`;
      },
      providesTags: ["Lessons"],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetUnitLessonsQuery,
  useGetLessonQuery,
  usePrefetchLessonQuery,
  useLazyGetLessonQuery,
  // Keep old exports for compatibility
  useGetFreeLessonQuery,
  useGetAllUnitsQuery,
  useSearchLessonsQuery,
} = freeLessonsApi;