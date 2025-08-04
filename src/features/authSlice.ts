// ts-client/src/features/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "@/types";

// Token storage utilities
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const userData = localStorage.getItem("auth_user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const storeAuthData = (user: User, token?: string): void => {
  try {
    localStorage.setItem("auth_user", JSON.stringify(user));
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  } catch (error) {
    console.warn("Failed to store auth data:", error);
  }
};

const clearStoredAuthData = (): void => {
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  } catch (error) {
    console.warn("Failed to clear auth data:", error);
  }
};

// Initial state - will be rehydrated by Redux Persist
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Set to true initially, will be set to false after rehydration
  error: null,
  token: null,
};

interface UserLoggedInPayload {
  user: User;
  token?: string;
}

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action: PayloadAction<UserLoggedInPayload>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      
      // Store in localStorage for backup (Redux Persist handles main persistence)
      storeAuthData(action.payload.user, action.payload.token);
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.token = null;
      
      // Clear localStorage
      clearStoredAuthData();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // Action to set loading to false after rehydration
    setRehydrated: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration from Redux Persist
    builder.addMatcher(
      (action) => action.type === 'persist/REHYDRATE',
      (state, action: any) => {
        if (action.payload?.auth) {
          const rehydratedAuth = action.payload.auth;
          // Validate rehydrated data
          if (rehydratedAuth.user && rehydratedAuth.token) {
            state.user = rehydratedAuth.user;
            state.token = rehydratedAuth.token;
            state.isAuthenticated = true;
            state.error = null;
          }
        }
        state.isLoading = false;
      }
    );
  },
});

export const { userLoggedIn, userLoggedOut, setLoading, setError, setRehydrated } = authSlice.actions;
export default authSlice.reducer;