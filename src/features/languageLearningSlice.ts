// ts-client/src/features/languageLearningSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LanguageLearningState, ExerciseResult, RootState } from "@/types";

const initialState: LanguageLearningState = {
  currentLesson: null,
  currentUnit: null,
  completedLessons: [],
  progress: {},
  streak: 0,
  totalPoints: 0,
  isLoading: false,
  error: null,
};

interface LessonSessionState {
  currentLessonId: string | null;
  currentUnitId: string | null;
  currentExerciseIndex: number;
  exerciseResults: ExerciseResult[];
  isLessonActive: boolean;
  sessionStartTime: number | null;
  sessionDuration: number;
  currentSection: "vocabulary" | "exercises";
}

// Extended state for lesson session management
interface ExtendedLanguageLearningState extends LanguageLearningState, LessonSessionState {}

const extendedInitialState: ExtendedLanguageLearningState = {
  ...initialState,
  currentLessonId: null,
  currentUnitId: null,
  currentExerciseIndex: 0,
  exerciseResults: [],
  isLessonActive: false,
  sessionStartTime: null,
  sessionDuration: 0,
  currentSection: "vocabulary",
};

interface StartLessonPayload {
  lessonId: string;
}

const languageLearningSlice = createSlice({
  name: "languageLearning",
  initialState: extendedInitialState,
  reducers: {
    startLessonSession: (state, action: PayloadAction<StartLessonPayload>) => {
      state.currentLessonId = action.payload.lessonId;
      // Extract unit ID from lesson ID (e.g., "1.2" → "1")
      state.currentUnitId = action.payload.lessonId.split(".")[0];
      state.currentExerciseIndex = 0;
      state.exerciseResults = [];
      state.isLessonActive = true;
      state.sessionStartTime = Date.now();
      state.sessionDuration = 0;
      state.currentSection = "vocabulary";
    },

    endLessonSession: (state) => {
      state.isLessonActive = false;
      state.sessionDuration = state.sessionStartTime
        ? Date.now() - state.sessionStartTime
        : 0;
    },

    resetLessonSession: (state) => {
      state.currentLessonId = null;
      state.currentUnitId = null;
      state.currentExerciseIndex = 0;
      state.exerciseResults = [];
      state.isLessonActive = false;
      state.sessionStartTime = null;
      state.sessionDuration = 0;
      state.currentSection = "vocabulary";
    },

    nextExercise: (state) => {
      if (state.currentExerciseIndex < 10) { // Max 10 exercises
        state.currentExerciseIndex += 1;
      }
    },

    previousExercise: (state) => {
      if (state.currentExerciseIndex > 0) {
        state.currentExerciseIndex -= 1;
      }
    },

    recordExerciseResult: (state, action: PayloadAction<ExerciseResult>) => {
      const result = action.payload;
      // Remove existing result for this exercise
      state.exerciseResults = state.exerciseResults.filter(
        (r) => r.exerciseId !== result.exerciseId
      );
      // Add the new result
      state.exerciseResults.push(result);
    },

    updateSessionDuration: (state) => {
      if (state.sessionStartTime && state.isLessonActive) {
        state.sessionDuration = Date.now() - state.sessionStartTime;
      }
    },

    setCurrentSection: (state, action: PayloadAction<"vocabulary" | "exercises">) => {
      state.currentSection = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  startLessonSession,
  endLessonSession,
  resetLessonSession,
  nextExercise,
  previousExercise,
  recordExerciseResult,
  updateSessionDuration,
  setCurrentSection,
  setLoading,
  setError,
} = languageLearningSlice.actions;

// Typed selectors
export const selectCurrentExerciseIndex = (state: RootState): number =>
  (state.languageLearning as any).currentExerciseIndex || 0;

export const selectExerciseResults = (state: RootState): ExerciseResult[] =>
  (state.languageLearning as any).exerciseResults || [];

export const selectIsLessonActive = (state: RootState): boolean =>
  (state.languageLearning as any).isLessonActive || false;

export const selectCurrentUnit = (state: RootState): string | null =>
  (state.languageLearning as any).currentUnitId || null;

export const selectSessionDuration = (state: RootState): number => {
  const languageLearning = state.languageLearning as any;
  const { sessionStartTime, isLessonActive, sessionDuration } = languageLearning;

  if (isLessonActive && sessionStartTime) {
    return Date.now() - sessionStartTime;
  }

  return sessionDuration || 0;
};

export const selectCurrentSection = (state: RootState): "vocabulary" | "exercises" =>
  (state.languageLearning as any).currentSection || "vocabulary";

export default languageLearningSlice.reducer;