// ts-client/src/components/LessonCompletionModal.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  Star,
} from "lucide-react";

interface UnitLessonCounts {
  [key: number]: number;
}

interface RecentLesson {
  lessonId: string;
  status: string;
}

interface UserProgress {
  recentLessons?: RecentLesson[];
}

interface LessonResult {
  accuracy: number;
  passed: boolean;
  needsReview: boolean;
  minimumRequired?: number;
  totalExercises: number;
  correctAnswers: number;
  timeSpent: number;
}

interface PerformanceInfo {
  message: string;
  description: string;
  color: string;
  bgColor: string;
  darkBg: string;
}

interface LessonCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonResult: LessonResult | null;
  lessonTitle: string;
  currentLessonId: string;
  userProgress?: UserProgress | null;
  onContinue?: () => void;
}

// Helper function to determine next uncompleted lesson
const getNextLessonId = (currentLessonId: string, userProgress: UserProgress | null = null): string | null => {
  const [unitId, lessonNumber] = currentLessonId.split(".").map(Number);

  // Define lesson progression: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 2.1 → 2.2 etc.
  const unitLessonCounts: UnitLessonCounts = {
    1: 5, // Unit 1 has 5 lessons
    2: 5, // Unit 2 has 5 lessons
    3: 5, // Unit 3 has 5 lessons
    4: 5, // Unit 4 has 5 lessons
    5: 5, // Unit 5 has 5 lessons
  };

  // Function to check if lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    if (!userProgress?.recentLessons) return false;
    const progress = userProgress.recentLessons.find(
      (p) => p.lessonId === lessonId
    );
    return progress?.status === "completed";
  };

  // Check remaining lessons in current unit
  for (
    let lesson = lessonNumber + 1;
    lesson <= unitLessonCounts[unitId];
    lesson++
  ) {
    const candidateId = `${unitId}.${lesson}`;
    if (!isLessonCompleted(candidateId)) {
      return candidateId;
    }
  }

  // Check lessons in subsequent units
  for (
    let unit = unitId + 1;
    unit <= Object.keys(unitLessonCounts).length;
    unit++
  ) {
    for (let lesson = 1; lesson <= unitLessonCounts[unit]; lesson++) {
      const candidateId = `${unit}.${lesson}`;
      if (!isLessonCompleted(candidateId)) {
        return candidateId;
      }
    }
  }

  // No more uncompleted lessons available
  return null;
};

const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  onClose,
  lessonResult,
  lessonTitle,
  currentLessonId,
  userProgress,
  onContinue,
}) => {
  const navigate = useNavigate();

  if (!lessonResult) return null;

  const {
    accuracy,
    passed,
    needsReview,
    minimumRequired = 60, // Default to 60 for display
    totalExercises,
    correctAnswers,
    timeSpent,
  } = lessonResult;

  const minutes = Math.floor(timeSpent / 60000);
  const seconds = Math.floor((timeSpent % 60000) / 1000);

  // UPDATED: Performance messaging based on new thresholds
  const getPerformanceMessage = (): PerformanceInfo => {
    if (accuracy >= 90) {
      return {
        message: "Outstanding! बहुत बढ़िया! 🌟",
        description: "You've mastered this lesson excellently!",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        darkBg: "dark:bg-green-900/20 dark:border-green-700",
      };
    }
    if (accuracy >= 80) {
      return {
        message: "Excellent! शानदार काम! 🎉",
        description: "Great understanding of the concepts!",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        darkBg: "dark:bg-blue-900/20 dark:border-blue-700",
      };
    }
    if (accuracy >= 70) {
      return {
        message: "Great job! अच्छा काम! 👏",
        description: "You're making good progress!",
        color: "text-purple-600",
        bgColor: "bg-purple-50 border-purple-200",
        darkBg: "dark:bg-purple-900/20 dark:border-purple-700",
      };
    }
    if (passed) {
      return {
        message: "Well done! बधाई हो! ✨",
        description: "You've successfully completed this lesson!",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        darkBg: "dark:bg-green-900/20 dark:border-green-700",
      };
    }
    return {
      message: "Keep practicing! अभ्यास करते रहिए! 💪",
      description: `You need ${minimumRequired}% to proceed. Try again to improve!`,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      darkBg: "dark:bg-blue-900/20 dark:border-blue-700",
    };
  };

  const performanceInfo = getPerformanceMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            {passed ? (
              <Trophy className="h-6 w-6 text-yellow-500" />
            ) : (
              <BookOpen className="h-6 w-6 text-blue-500" />
            )}
            Lesson Complete!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {lessonTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Performance Message */}
          <Card
            className={`${performanceInfo.bgColor} ${performanceInfo.darkBg} border`}
          >
            <CardContent className="p-4 text-center">
              <h3
                className={`text-lg font-semibold ${performanceInfo.color} mb-2`}
              >
                {performanceInfo.message}
              </h3>
              <p
                className={`text-sm ${performanceInfo.color.replace(
                  "600",
                  "700"
                )} dark:${performanceInfo.color.replace("600", "300")}`}
              >
                {performanceInfo.description}
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Accuracy */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    Accuracy
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {accuracy}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {correctAnswers}/{totalExercises} correct
                </div>
              </CardContent>
            </Card>

            {/* Time */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    Time
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {minutes}:{String(seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-500 mt-1">minutes</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Status */}
          {!passed && (
            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Keep Learning!
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You need at least {minimumRequired}% accuracy to proceed
                      to the next lesson. Review the material and try again!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {passed ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Review Lesson
                </Button>
                <Button
                  onClick={() => {
                    // FIXED: Auto-close modal immediately
                    onClose();

                    // Navigate to next uncompleted lesson
                    const nextLessonId = getNextLessonId(
                      currentLessonId,
                      userProgress
                    );
                    if (nextLessonId) {
                      // Add state to indicate this is a fresh lesson start
                      navigate(`/learn/lesson/${nextLessonId}`, {
                        state: {
                          fromCompletion: true,
                          resetToVocabulary: true,
                        },
                      });
                    } else {
                      navigate("/learn"); // Go to dashboard if no more lessons
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {getNextLessonId(currentLessonId, userProgress)
                    ? "Next Lesson"
                    : "Dashboard"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    onClose();
                    navigate("/learn");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Encouragement Message */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {passed
                ? "🎉 Ready for the next challenge!"
                : "💪 Practice makes perfect! You're improving with each attempt."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonCompletionModal;