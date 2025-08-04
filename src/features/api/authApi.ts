// ts-client/src/features/api/authApi.ts
// Enhanced authentication API with Chrome FedCM compatibility

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { isChrome, getBrowserInfo } from "@/utils/browserUtils";
import { clearAuthCookies, clearAuthStorage } from "@/utils/cookieUtils";
import type { 
  GoogleLoginRequest, 
  AuthResponse, 
  UpdateProfileRequest,
  RegisterRequest,
  LoginRequest,
  ApiResponse,
  BrowserInfo
} from "@/types";
import type { RootState } from "@/app/store";

// Import other API slices for cache invalidation
import { courseApi } from "./courseApi";
import { purchaseApi } from "./purchaseApi";
import { courseProgressApi } from "./courseProgressApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file");
}

// Enhanced base query with Chrome-specific headers
const enhancedBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/user`,
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint }) => {
    try {
      const browserInfo: BrowserInfo = getBrowserInfo();

      // Add Chrome-specific headers for FedCM compatibility
      if (browserInfo.isChrome) {
        headers.set("X-Browser", "Chrome");
        if (browserInfo.chromeVersion) {
          headers.set("X-Chrome-Version", browserInfo.chromeVersion);
        }

        // Indicate FedCM capability
        if (browserInfo.supportsFedCM) {
          headers.set("X-Supports-FedCM", "true");
        }
      } else if (browserInfo.name === "Firefox") {
        headers.set("X-Browser", "Firefox");
      }

      // Add request timestamp for debugging
      headers.set("X-Request-Timestamp", new Date().toISOString());
    } catch (error) {
      // Continue without browser headers if detection fails
      console.warn(
        "Browser detection failed, continuing without browser headers:",
        error
      );
    }

    return headers;
  },
  // Enhanced timeout for Chrome FedCM issues
  timeout: isChrome() ? 10000 : 5000,
});

export const authApi = createApi({
  reducerPath: "authApi",
  tagTypes: ["User"],
  baseQuery: enhancedBaseQuery,

  endpoints: (builder) => ({
    googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (credential) => ({
        url: "google-login",
        method: "POST",
        body: { credential },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
            console.log("✅ Google login successful");
          }
        } catch (error) {
          console.error("Google login error:", error);
          clearAuthStorage();
        }
      },
    }),

    updateUser: builder.mutation<ApiResponse, UpdateProfileRequest>({
      query: (updatedData) => ({
        url: "profile/update",
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["User"],
    }),

    loadUser: builder.query<ApiResponse, void>({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch (error) {
          console.log("Load user failed:", error);
          dispatch(userLoggedOut());
          clearAuthStorage();
        }
      },
    }),

    // Enhanced logout with Chrome-specific FedCM handling
    logoutUser: builder.mutation<ApiResponse, void>({
      query: () => {
        const browserInfo: BrowserInfo = getBrowserInfo();

        return {
          url: "logout",
          method: "GET",
          // Add Chrome-specific query params
          params: browserInfo.isChrome
            ? {
                browser: "chrome",
                version: browserInfo.chromeVersion || "",
              }
            : {},
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const browserInfo: BrowserInfo = getBrowserInfo();

        try {
          console.log("📡 Attempting API logout...");

          // Set timeout for Chrome FedCM issues
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error("Logout timeout")),
              browserInfo.isChrome ? 8000 : 5000
            );
          });

          // Race between API call and timeout
          await Promise.race([queryFulfilled, timeoutPromise]);

          console.log("✅ API logout successful");

          // Invalidate all auth-related caches
          dispatch(authApi.util.invalidateTags(["User"]));
          dispatch(
            courseApi.util.invalidateTags([
              "Refetch_Creator_Course",
              "Refetch_Lecture",
            ])
          );
          dispatch(purchaseApi.util.invalidateTags(["PurchaseStatus"]));
          dispatch(courseProgressApi.util.invalidateTags(["CourseProgress"]));

          // Clear Redux auth state
          dispatch(userLoggedOut());

          // Chrome-specific cleanup
          if (browserInfo.isChrome) {
            console.log("🍪 Performing Chrome-specific cleanup...");
            setTimeout(() => {
              clearAuthCookies();
            }, 100);
          }
        } catch (error: any) {
          console.error("❌ API logout failed:", error);

          // Always clear local state regardless of API failure
          dispatch(userLoggedOut());

          // Check for Chrome-specific errors
          const isChromeError =
            browserInfo.isChrome &&
            (error.message?.includes("timeout") ||
              error.message?.includes("AbortError") ||
              error.message?.includes("FedCM") ||
              error.name === "AbortError");

          if (isChromeError) {
            console.log("🔍 Chrome-specific logout error detected");

            // Aggressive cleanup for Chrome
            clearAuthCookies();
            clearAuthStorage();

            // Clear FedCM credentials if available
            if (
              navigator.credentials &&
              (navigator.credentials as any).preventSilentAccess
            ) {
              try {
                await (navigator.credentials as any).preventSilentAccess();
                console.log("✅ FedCM credentials cleared");
              } catch (fedCMError) {
                console.warn("⚠️ FedCM cleanup failed:", fedCMError);
              }
            }
          }

          // Invalidate caches even on error
          dispatch(authApi.util.invalidateTags(["User"]));
          dispatch(
            courseApi.util.invalidateTags([
              "Refetch_Creator_Course",
              "Refetch_Lecture",
            ])
          );
          dispatch(purchaseApi.util.invalidateTags(["PurchaseStatus"]));
          dispatch(courseProgressApi.util.invalidateTags(["CourseProgress"]));

          // Re-throw for component handling
          throw error;
        }
      },
    }),

    // Development-only authentication methods
    registerUser: builder.mutation<AuthResponse, RegisterRequest>({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),

    loginUser: builder.mutation<AuthResponse, LoginRequest>({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch (error) {
          console.error("Login error:", error);
        }
      },
    }),
  }),
});

export const {
  useGoogleLoginMutation,
  useUpdateUserMutation,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
} = authApi;