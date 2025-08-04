// ts-client/src/pages/learner/LessonInterface.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetLessonQuery } from "@/features/api/freeLessonsApi";
import {
  useStartLessonMutation,
  useCompleteLessonMutation,
} from "@/features/api/userProgressApi";
import { useGetUserProgressQuery } from "@/features/api/userProgressApi";
import {
  startLessonSession,
  endLessonSession,
  resetLessonSession,
  nextExercise,
  previousExercise,
  recordExerciseResult,
  selectCurrentExerciseIndex,
  selectExerciseResults,
  selectIsLessonActive,
  selectSessionDuration,
} from "@/features/languageLearningSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle,
  Trophy,
  Clock,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import VocabularySection from "@/components/VocabularySection";
import ExerciseRenderer from "@/components/ExerciseRenderer";
import LessonCompletionModal from "@/components/LessonCompletionModal";
import type { RootState, Exercise, ExerciseResult } from "@/types";

interface LessonResult {
  accuracy: number;
  passed: boolean;
  needsReview: boolean;
  minimumRequired: number;
  totalExercises: number;
  correctAnswers: number;
  timeSpent: number;
}

type SectionType = "vocabulary" | "exercises";

// Helper function to validate exercise results for new data structure
const validateExerciseResult = (exercise: Exercise, userAnswer: any): boolean => {
  if (!exercise || userAnswer === undefined || userAnswer === null) {
    return false;
  }

  // Handle different exercise types
  switch (exercise.type) {
    case "translation":
      // Ensure the answer is one of the valid options
      if (exercise.options && Array.isArray(exercise.options)) {
        return exercise.options.includes(userAnswer);
      }
      return true;

    case "multiple_choice":
    case "scenario_response":
      // Check if answer is one of the options
      if (exercise.options && Array.isArray(exercise.options)) {
        return exercise.options.includes(userAnswer);
      }
      return true;

    case "fill_blank":
      // For fill blank, userAnswer should be a string
      return typeof userAnswer === "string" && userAnswer.trim().length > 0;

    default:
      return true;
  }
};

const LessonInterface = (): JSX.Element => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Local state
  const [currentSection, setCurrentSection] = useState<SectionType>("vocabulary");
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);

  // Redux state
  const currentExerciseIndex = useSelector(selectCurrentExerciseIndex);
  const exerciseResults = useSelector(selectExerciseResults);
  const isLessonActive = useSelector(selectIsLessonActive);
  const sessionDuration = useSelector(selectSessionDuration);

  // API hooks
  const {
    data: lesson,
    isLoading: lessonLoading,
    error: lessonError,
  } = useGetLessonQuery(lessonId!);

  const { data: userProgressData, isLoading: progressLoading } =
    useGetUserProgressQuery();

  const [startLesson] = useStartLessonMutation();
  const [completeLesson] = useCompleteLessonMutation();

  // Reset to vocabulary tab when lessonId changes
  useEffect(() => {
    // Reset to vocabulary section for new lessons
    setCurrentSection("vocabulary");

    // Reset lesson session state if coming from completion
    if ((location.state as any)?.fromCompletion) {
      dispatch(resetLessonSession());
      // Clear the navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [lessonId, location.state, dispatch, navigate]);

  // Start lesson when component mounts
  useEffect(() => {
    if (lesson && !isLessonActive && lessonId) {
      const [unitId] = lessonId.split(".");
      dispatch(startLessonSession({ lessonId }));
      startLesson({ lessonId, unitId });
    }
  }, [lesson, lessonId, isLessonActive, dispatch, startLesson]);

  // Handle lesson completion with enhanced validation and thresholds
  const handleLessonComplete = async (): Promise<void> => {
    if (!lesson || exerciseResults.length === 0 || !lessonId) return;

    // Validate all exercise results with new data structure
    const validResults = exerciseResults.filter((result) => {
      const exercise = lesson.exercises.find(
        (ex) => ex.exerciseId === result.exerciseId
      );
      return exercise && validateExerciseResult(exercise, result.userAnswer);
    });

    if (validResults.length !== exerciseResults.length) {
      console.error("Some exercise results failed validation");
      return;
    }

    const totalExercises = lesson.exercises.length;
    const correctAnswers = validResults.filter(
      (result) => result.correct
    ).length;
    const accuracy = Math.round((correctAnswers / totalExercises) * 100);

    try {
      const result = await completeLesson({
        lessonId,
        exerciseResults: validResults,
        timeSpent: Math.round(sessionDuration / 1000),
      }).unwrap();

      // Use backend response for pass/fail status (58% threshold)
      setLessonResult({
        accuracy,
        passed: result.result.passed, // Backend handles 58% threshold
        needsReview: result.result.needsReview,
        minimumRequired: result.result.minimumRequired, // 60 for display
        totalExercises,
        correctAnswers,
        timeSpent: sessionDuration,
      });

      dispatch(endLessonSession());
      setShowCompletion(true);
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    }
  };

  // Check if all exercises are completed
  const allExercisesCompleted =
    lesson?.exercises && exerciseResults.length === lesson.exercises.length;

  if (lessonLoading) return <LoadingSpinner />;

  if (lessonError || !lesson) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Lesson not found
        </h2>
        <p className="text-gray-600 mb-4">Unable to load lesson content.</p>
        <Button onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const progressPercentage =
    currentSection === "vocabulary"
      ? 25
      : 25 +
        Math.round((exerciseResults.length / lesson.exercises.length) * 75);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Reduced header spacing and padding */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header Section - Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/learn")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Badge variant="secondary" className="px-3 py-1">
              {lesson.difficulty}
            </Badge>
          </div>

          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lesson.title}
            </h1>
            <p className="text-lg text-blue-600 dark:text-blue-400">
              {lesson.titleHindi}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lesson.description}
            </p>
          </div>

          {/* Progress Bar - Compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-600 dark:text-gray-400">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Section Navigation - Compact */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentSection === "vocabulary" ? "default" : "outline"}
            onClick={() => setCurrentSection("vocabulary")}
            className="flex-1 py-2"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Vocabulary
          </Button>
          <Button
            variant={currentSection === "exercises" ? "default" : "outline"}
            onClick={() => setCurrentSection("exercises")}
            className="flex-1 py-2"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Exercises (
            {currentSection === "exercises"
              ? `${currentExerciseIndex + 1}/${lesson.exercises.length}`
              : `${exerciseResults.length}/${lesson.exercises.length}`}
            )
          </Button>
        </div>

        {/* Content Sections */}
        {currentSection === "vocabulary" && (
          <VocabularySection
            vocabulary={lesson.vocabulary}
            onComplete={() => setCurrentSection("exercises")}
          />
        )}

        {currentSection === "exercises" && (
          <div className="space-y-4">
            {/* Exercise Navigation - Compact */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
              </h2>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(previousExercise())}
                  disabled={currentExerciseIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(nextExercise())}
                  disabled={currentExerciseIndex >= lesson.exercises.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Exercise Content */}
            {lesson.exercises[currentExerciseIndex] && (
              <ExerciseRenderer
                key={`${lesson.exercises[currentExerciseIndex].exerciseId}-${currentExerciseIndex}`}
                exercise={lesson.exercises[currentExerciseIndex]}
                onExerciseComplete={(result: ExerciseResult) => {
                  // Validate result before recording
                  const exercise = lesson.exercises[currentExerciseIndex];
                  if (validateExerciseResult(exercise, result.userAnswer)) {
                    dispatch(recordExerciseResult(result));

                    // Auto-advance to next exercise after short delay
                    setTimeout(() => {
                      if (currentExerciseIndex < lesson.exercises.length - 1) {
                        dispatch(nextExercise());
                      }
                    }, 1500);
                  } else {
                    console.error("Exercise result validation failed:", result);
                  }
                }}
              />
            )}

            {/* Complete Lesson Button */}
            {allExercisesCompleted && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLessonComplete}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Complete Lesson
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Time Spent Display - Compact */}
        {isLessonActive && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              {Math.floor(sessionDuration / 60000)}:
              {String(Math.floor((sessionDuration % 60000) / 1000)).padStart(
                2,
                "0"
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      <LessonCompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        lessonResult={lessonResult}
        lessonTitle={lesson.title}
        currentLessonId={lessonId!}
        userProgress={userProgressData?.progress}
        onContinue={() => {
          setShowCompletion(false);
          navigate("/learn");
        }}
      />
    </div>
  );
};

export default LessonInterface;