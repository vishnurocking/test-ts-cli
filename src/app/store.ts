// ts-client/src/app/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { publicApi } from "@/features/api/publicApi";
import { freeLessonsApi } from "@/features/api/freeLessonsApi";
import { userProgressApi } from "@/features/api/userProgressApi";
import authSlice from "@/features/authSlice";
import languageLearningSlice from "@/features/languageLearningSlice";

// Redux persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
  version: 1,
};

// Combine reducers
const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [courseProgressApi.reducerPath]: courseProgressApi.reducer,
  [publicApi.reducerPath]: publicApi.reducer,
  [freeLessonsApi.reducerPath]: freeLessonsApi.reducer,
  [userProgressApi.reducerPath]: userProgressApi.reducer,
  auth: authSlice,
  languageLearning: languageLearningSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const appStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      courseApi.middleware,
      purchaseApi.middleware,
      courseProgressApi.middleware,
      publicApi.middleware,
      freeLessonsApi.middleware,
      userProgressApi.middleware
    ),
});

// Create persistor
export const persistor = persistStore(appStore);

// Infer RootState and AppDispatch types from store
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof appStore.dispatch;