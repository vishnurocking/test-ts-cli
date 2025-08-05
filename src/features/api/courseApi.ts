// ts-client/src/features/api/courseApi.ts
// Course API with TypeScript support

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseApi";
import type { 
  CreateCourseRequest, 
  UpdateCourseRequest,
  CourseSearchParams,
  ApiResponse,
  Course,
  Lecture 
} from "@/types";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: [
    // Original tag names for compatibility
    "Refetch_Creator_Course",
    "Refetch_Lecture", 
    "PurchaseStatus",
    // New tag names for better cache management
    "Course",
    "CourseDetail",
    "PublishedCourses",
  ],
  baseQuery: createBaseQuery("/course"),
  endpoints: (builder) => ({
    createCourse: builder.mutation<ApiResponse, CreateCourseRequest>({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),

    getSearchCourse: builder.query<ApiResponse<Course[]>, CourseSearchParams>({
      query: ({ searchQuery, categories, sortByPrice }: any) => {
        let queryString = `/search?query=${encodeURIComponent(searchQuery || '')}`;
        if (categories && categories.length > 0) {
          const categoriesString = categories.map((cat: string) => encodeURIComponent(cat)).join(",");
          queryString += `&categories=${categoriesString}`;
        }
        if (sortByPrice) {
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`;
        }
        return {
          url: queryString,
          method: "GET",
        };
      },
      providesTags: ["Course"],
    }),

    getPublishedCourse: builder.query<ApiResponse<Course[]>, void>({
      query: () => "/published-courses",
      providesTags: ["PublishedCourses"],
    }),

    // FIXED: Keep original endpoint name (singular)
    getCreatorCourse: builder.query<ApiResponse<Course[]>, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
    }),

    editCourse: builder.mutation<ApiResponse, { courseData: UpdateCourseRequest; courseId: string }>({
      query: ({ courseData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: courseData,
      }),
      // Enhanced invalidation with both old and new tags
      invalidatesTags: (result, error, { courseId }) => [
        "Refetch_Creator_Course", // Original tag
        { type: "PurchaseStatus", id: courseId }, // Original tag
        { type: "CourseDetail", id: courseId }, // New tag for purchase fix
        { type: "Course", id: courseId }, // New tag for purchase fix
      ],
    }),

    // FIXED: Enhanced getCourseById with proper cache tags
    getCourseById: builder.query<{ course: Course; lectures: Lecture[] }, string>({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      // Provide both old and new tags for compatibility
      providesTags: (result, error, courseId) => [
        { type: "PurchaseStatus", id: courseId }, // Original tag
        { type: "CourseDetail", id: courseId }, // New tag for purchase fix
        { type: "Course", id: courseId }, // New tag for purchase fix
      ],
      // Fix transformResponse to extract data field (matching other APIs)
      transformResponse: (response: ApiResponse<{ course: Course; lectures: Lecture[] }>) => {
        console.log("🔄 Course API Response:", response);
        return response.data; // Extract data field to match frontend expectation
      },
    }),

    createLecture: builder.mutation<ApiResponse, { lectureTitle: string; courseId: string }>({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle },
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),

    getCourseLecture: builder.query<ApiResponse<Lecture[]>, string>({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),

    editLecture: builder.mutation<ApiResponse, {
      lectureTitle: string;
      videoInfo?: any;
      isPreviewFree?: boolean;
      courseId: string;
      lectureId: string;
    }>({
      query: ({
        lectureTitle,
        videoInfo,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree },
      }),
      // Enhanced invalidation for lecture changes
      invalidatesTags: (result, error, { courseId }) => [
        "Refetch_Lecture", // Original tag
        { type: "CourseDetail", id: courseId }, // New tag for course detail updates
      ],
    }),

    removeLecture: builder.mutation<ApiResponse, { courseId: string; lectureId: string }>({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        "Refetch_Lecture", // Original tag
        { type: "CourseDetail", id: courseId }, // New tag for course detail updates
      ],
    }),

    getLectureById: builder.query<ApiResponse<Lecture>, string>({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),

    publishCourse: builder.mutation<ApiResponse, { courseId: string; query: string }>({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "PurchaseStatus", id: courseId }, // Original tag
        "Refetch_Creator_Course", // Refresh creator's course list
        "PublishedCourses", // Refresh published courses list
      ],
    }),
  }),
});

// FIXED: Keep all original export names exactly as they were
export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery, // Original name (singular)
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
} = courseApi;