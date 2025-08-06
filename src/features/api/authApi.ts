// ts-client/src/features/api/authApi.ts
// Enhanced authentication API with Chrome FedCM compatibility - FIXED

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
  BrowserInfo,
  User,
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
    // Register user
    registerUser: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "register",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.success && result.data.user && result.data.token) {
            dispatch(
              userLoggedIn({
                user: result.data.user,
                token: result.data.token,
              })
            );
            // Store token for future requests
            localStorage.setItem("auth_token", result.data.token);
            console.log("✅ Registration successful");
          }
        } catch (error) {
          console.error("Registration error:", error);
          clearAuthStorage();
        }
      },
    }),

    // Login user
    loginUser: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.success && result.data.user && result.data.token) {
            dispatch(
              userLoggedIn({
                user: result.data.user,
                token: result.data.token,
              })
            );
            // Store token for future requests
            localStorage.setItem("auth_token", result.data.token);
            console.log("✅ Login successful");
          }
        } catch (error) {
          console.error("Login error:", error);
          clearAuthStorage();
        }
      },
    }),

    // Google OAuth login
    googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (credential) => ({
        url: "google-login",
        method: "POST",
        body: { credential },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.success && result.data.user && result.data.token) {
            dispatch(
              userLoggedIn({
                user: result.data.user,
                token: result.data.token,
              })
            );
            // Store token for future requests
            localStorage.setItem("auth_token", result.data.token);
            console.log("✅ Google login successful");
          }
        } catch (error) {
          console.error("Google login error:", error);
          clearAuthStorage();
        }
      },
    }),

    // Load user profile - FIXED
    loadUser: builder.query<
      { success: boolean; message: string; user: User },
      void
    >({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch, getState }) {
        try {
          const result = await queryFulfilled;
          console.log("Profile API response:", result.data);

          if (result.data.success && result.data.user) {
            const state = getState() as RootState;
            const currentToken =
              state.auth.token || localStorage.getItem("auth_token");

            // Update Redux state with fresh user data
            dispatch(
              userLoggedIn({
                user: result.data.user,
                token: currentToken || "",
              })
            );

            console.log("✅ User profile loaded successfully");
          }
        } catch (error: any) {
          console.error("Load user error:", error);

          // Handle authentication errors
          if (error.status === 401) {
            console.log("🔐 Authentication failed - clearing auth state");
            dispatch(userLoggedOut());
            clearAuthStorage();
            clearAuthCookies();
          }
        }
      },
      // Transform response to match expected format
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: response.success,
            message: response.message,
            user: response.data,
          };
        }
        return response;
      },
    }),

    // Update user profile
    updateUser: builder.mutation<ApiResponse, UpdateProfileRequest>({
      query: (updatedData) => ({
        url: "profile/update",
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch, getState }) {
        try {
          const result = await queryFulfilled;
          if (result.data.success && result.data.data) {
            const state = getState() as RootState;
            const currentToken = state.auth.token;

            // Update Redux state with updated user data
            dispatch(
              userLoggedIn({
                user: result.data.data,
                token: currentToken || "",
              })
            );

            console.log("✅ Profile updated successfully");
          }
        } catch (error) {
          console.error("Update profile error:", error);
        }
      },
    }),

    // Logout user
    logoutUser: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          console.log("✅ Logout successful");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Always clear auth state regardless of API response
          dispatch(userLoggedOut());
          clearAuthStorage();
          clearAuthCookies();

          // Invalidate all cached API data
          dispatch(courseApi.util.resetApiState());
          dispatch(purchaseApi.util.resetApiState());
          dispatch(courseProgressApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGoogleLoginMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useLogoutUserMutation,
} = authApi;
