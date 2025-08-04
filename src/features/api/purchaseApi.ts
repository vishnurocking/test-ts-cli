// ts-client/src/features/api/purchaseApi.ts
// Purchase API with TypeScript support

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { 
  CreatePurchaseRequest,
  VerifyPaymentRequest, 
  ApiResponse,
  Purchase,
  Course
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file");
}

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  tagTypes: [
    "PurchaseStatus",
    "MyLearning",
    "AdminPurchases",
    // Add course-related tags to enable cross-API cache invalidation
    "CourseDetail",
    "Course",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/purchase`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<ApiResponse, string>({
      query: (courseId) => ({
        url: "/create-order",
        method: "POST",
        body: { courseId },
      }),
      // Don't invalidate anything on order creation, only on verification
    }),

    verifyPayment: builder.mutation<ApiResponse, VerifyPaymentRequest>({
      query: (paymentData) => ({
        url: "/verify-payment",
        method: "POST",
        body: paymentData,
      }),
      // CRITICAL FIX: Invalidate course cache when payment is verified
      invalidatesTags: (result, error, { courseId }) => {
        console.log(
          "🔄 Purchase verified, invalidating cache for course:",
          courseId
        );

        if (result?.success) {
          // Invalidate course-specific data
          return [
            { type: "CourseDetail", id: courseId },
            { type: "Course", id: courseId },
            { type: "PurchaseStatus", id: courseId },
            "MyLearning", // Also invalidate user's course list
          ];
        }

        // If payment failed, don't invalidate course data
        return [];
      },
      // Add transform response for debugging
      transformResponse: (response: ApiResponse, meta, arg) => {
        console.log("💳 Payment verification response:", response);
        console.log("💳 Payment data sent:", arg);
        return response;
      },
    }),

    getMyLearning: builder.query<ApiResponse<{ courses: Course[] }>, void>({
      query: () => ({
        url: "/my-courses",
        method: "GET",
      }),
      providesTags: ["MyLearning"],
      // Add transform response for debugging
      transformResponse: (response: any) => {
        console.log("📚 My Learning Response:", response);

        // Ensure courses have required fields for Course component
        if (response?.courses) {
          response.courses = response.courses.map((course: any) => ({
            ...course,
            // Ensure required fields are present
            courseId: course.courseId || course.course_id,
            courseTitle: course.courseTitle || course.course_title,
            courseThumbnail:
              course.courseThumbnail ||
              course.course_thumbnail ||
              "/default-course.png",
            coursePrice: course.coursePrice || course.amount || 0,
          }));
        }

        return response;
      },
    }),

    getAllPurchases: builder.query<ApiResponse<Purchase[]>, { page?: number; limit?: number; status?: string }>({
      query: ({ page = 1, limit = 50, status = "completed" } = {}) => ({
        url: `/all?page=${page}&limit=${limit}&status=${status}`,
        method: "GET",
      }),
      providesTags: ["AdminPurchases"],
    }),

    // NEW: Add query to check specific purchase status
    checkPurchaseStatus: builder.query<ApiResponse<Purchase>, string>({
      query: (courseId) => ({
        url: `/status/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "PurchaseStatus", id: courseId },
      ],
    }),

    // Keep these for backwards compatibility
    createPurchaseOrder: builder.mutation<ApiResponse, CreatePurchaseRequest>({
      query: (purchaseData) => ({
        url: "/create-order",
        method: "POST", 
        body: purchaseData,
      }),
    }),

    getPurchaseStatus: builder.query<ApiResponse<Purchase>, string>({
      query: (courseId) => `/status/${courseId}`,
      providesTags: ["PurchaseStatus"],
    }),

    getUserPurchases: builder.query<ApiResponse<Purchase[]>, void>({
      query: () => "/user-purchases",
      providesTags: ["MyLearning"],
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useGetMyLearningQuery,
  useGetAllPurchasesQuery,
  useCheckPurchaseStatusQuery, // New hook for purchase status
  // Keep old exports for compatibility
  useCreatePurchaseOrderMutation,
  useGetPurchaseStatusQuery,
  useGetUserPurchasesQuery,
} = purchaseApi;