// ts-client/src/features/api/freeLessonsApi.ts
// Free lessons API - TypeScript only, no backward compatibility

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
  tagTypes: ["Lessons", "LessonDetail"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/freelessons`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Get active lessons - TypeScript backend only
    getActiveLessons: builder.query<FreeLesson[], void>({
      query: () => "/active",
      providesTags: ["Lessons"],
      transformResponse: (response: ApiResponse<FreeLesson[]>) => {
        // TypeScript backend returns { success: true, data: [...] }
        return response.data || [];
      },
    }),

    // Get detailed lesson content with exercises
    getLesson: builder.query<FreeLesson, string>({
      query: (lessonId) => `/lesson/${lessonId}`,
      providesTags: (result, error, lessonId) => [
        { type: "LessonDetail", id: lessonId },
      ],
      transformResponse: (response: ApiResponse<FreeLesson>) => {
        return response.data as FreeLesson;
      },
    }),

    // Search lessons with parameters
    searchLessons: builder.query<FreeLesson[], LessonSearchParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.unitId) queryParams.append('unitId', params.unitId);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        
        return `/search?${queryParams.toString()}`;
      },
      providesTags: ["Lessons"],
      transformResponse: (response: ApiResponse<FreeLesson[]>) => {
        return response.data || [];
      },
    }),
  }),
});

export const {
  useGetActiveLessonsQuery,
  useGetLessonQuery,
  useLazyGetLessonQuery,
  useSearchLessonsQuery,
} = freeLessonsApi;