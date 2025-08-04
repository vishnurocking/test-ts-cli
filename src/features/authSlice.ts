// ts-client/src/features/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "@/types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
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
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.token = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { userLoggedIn, userLoggedOut, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;