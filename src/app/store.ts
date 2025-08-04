// ts-client/src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { publicApi } from "@/features/api/publicApi";
import { freeLessonsApi } from "@/features/api/freeLessonsApi";
import { userProgressApi } from "@/features/api/userProgressApi";
import authSlice from "@/features/authSlice";
import languageLearningSlice from "@/features/languageLearningSlice";

export const appStore = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [purchaseApi.reducerPath]: purchaseApi.reducer,
    [courseProgressApi.reducerPath]: courseProgressApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
    [freeLessonsApi.reducerPath]: freeLessonsApi.reducer,
    [userProgressApi.reducerPath]: userProgressApi.reducer,
    auth: authSlice,
    languageLearning: languageLearningSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      courseApi.middleware,
      purchaseApi.middleware,
      courseProgressApi.middleware,
      publicApi.middleware,
      freeLessonsApi.middleware,
      userProgressApi.middleware
    ),
});

// Infer RootState and AppDispatch types from store
export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;

// Initialize app with user data
const initializeApp = async (): Promise<void> => {
  await appStore.dispatch(
    authApi.endpoints.loadUser.initiate({}, { forceRefetch: true })
  );
};

initializeApp();