// ts-client/src/features/api/authApi.ts
// Enhanced authentication API with Chrome FedCM compatibility

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseApi";
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

export const authApi = createApi({
  reducerPath: "authApi",
  tagTypes: ["User"],
  baseQuery: createBaseQuery("/user"),

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
          if (result.data.user && result.data.token) {
            dispatch(userLoggedIn({ 
              user: result.data.user, 
              token: result.data.token 
            }));
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
      async onQueryStarted(_, { queryFulfilled, dispatch, getState }) {
        try {
          const result = await queryFulfilled;
          if (result.data.user) {
            const state = getState() as RootState;
            const currentToken = state.auth.token || localStorage.getItem("auth_token");
            dispatch(userLoggedIn({ 
              user: result.data.user, 
              token: currentToken || undefined 
            }));
          }
        } catch (error: any) {
          console.log("Load user failed:", error);
          // Only clear auth if it's a definitive auth error (401, 403)
          // Don't clear on network errors or other issues
          if (error?.status === 401 || error?.status === 403) {
            console.log("Authentication failed, clearing auth state");
            dispatch(userLoggedOut());
            clearAuthStorage();
          } else {
            console.log("Network or other error, keeping auth state intact");
            // Keep the user logged in but log the error
          }
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
          if (result.data.user && result.data.token) {
            dispatch(userLoggedIn({ 
              user: result.data.user,
              token: result.data.token 
            }));
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