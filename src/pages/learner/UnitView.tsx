// ts-client/src/pages/learner/UnitView.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useGetUnitLessonsQuery } from "@/features/api/freeLessonsApi";
import { useGetUnitProgressQuery } from "@/features/api/userProgressApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Users,
  LucideIcon,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FreeLesson, LessonProgress } from "@/types";

interface UnitInfo {
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  icon: LucideIcon;
  color: string;
}

interface LessonCardProps {
  lesson: FreeLesson;
  progress?: LessonProgress;
  isCompleted: boolean;
  isStarted: boolean;
  isLocked: boolean;
  onLessonClick: () => void;
}

const UnitView = (): JSX.Element => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  const {
    data: unitData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useGetUnitLessonsQuery(unitId!);
  const { data: progressData, isLoading: progressLoading } =
    useGetUnitProgressQuery(unitId!);

  // FIX: Add error handling and better loading states
  if (lessonsLoading || progressLoading) {
    return <LoadingSpinner />;
  }

  if (lessonsError) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Error Loading Unit
        </h2>
        <p className="text-gray-600 mb-4">
          Unable to load unit data. Please try again.
        </p>
        <Button onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // FIX: Better data handling with fallbacks
  const lessons = unitData?.lessons || [];
  const progressLessons = progressData?.lessons || [];

  // FIX: Debug logging - remove this after fixing
  console.log("Unit Data:", unitData);
  console.log("Progress Data:", progressData);
  console.log("Lessons:", lessons);

  // Create a map of lesson progress for quick lookup
  const progressMap = progressLessons.reduce((acc, progress) => {
    acc[progress.lessonId] = progress;
    return acc;
  }, {} as Record<string, LessonProgress>);

  const getUnitInfo = (unitId: string): UnitInfo => {
    const unitInfo: Record<string, UnitInfo> = {
      "1": {
        title: "Basic Greetings & Introductions",
        titleHindi: "बुनियादी अभिवादन और परिचय",
        description:
          "Learn essential English greetings and how to introduce yourself",
        descriptionHindi: "अंग्रेजी में जरूरी अभिवादन और अपना परिचय देना सीखें",
        icon: Users,
        color: "blue",
      },
      "2": {
        title: "Numbers & Time Expressions",
        titleHindi: "संख्याएं और समय की अभिव्यक्ति",
        description: "Master numbers, time, and basic counting in English",
        descriptionHindi: "अंग्रेजी में संख्याएं, समय और बुनियादी गिनती सीखें",
        icon: Clock,
        color: "purple",
      },
      "3": {
        title: "Family & Relationships",
        titleHindi: "परिवार और रिश्ते",
        description: "Learn to talk about family members and relationships",
        descriptionHindi: "परिवारजनों और रिश्तों के बारे में बात करना सीखें",
        icon: Target,
        color: "purple",
      },
    };
    return unitInfo[unitId] || unitInfo["1"];
  };

  const unitInfo = getUnitInfo(unitId!);
  const IconComponent = unitInfo.icon;

  // Calculate progress
  const completedLessons = progressLessons.filter(
    (p) => p.status === "completed"
  ).length;
  const totalLessons = lessons.length;
  const unitProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/learn")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg bg-${unitInfo.color}-100 dark:bg-${unitInfo.color}-900/20`}
            >
              <IconComponent className={`h-6 w-6 text-${unitInfo.color}-600`} />
            </div>
            <div>
              <Badge variant="outline">Unit {unitId}</Badge>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {unitInfo.title}
              </h1>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-1">
            {unitInfo.description}
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {unitInfo.descriptionHindi}
          </p>
        </div>
      </div>

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {completedLessons}/{totalLessons}
              </div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {unitProgress}%
              </div>
              <div className="text-sm text-gray-600">Unit Progress</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round(
                  progressLessons.reduce(
                    (sum, p) => sum + (p.timeSpent || 0),
                    0
                  ) / 60
                )}
                m
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={unitProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lessons in this Unit
        </h2>

        {/* FIX: Add fallback for empty lessons */}
        {lessons.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No lessons available
              </h3>
              <p className="text-gray-500 mb-4">
                This unit doesn't have any lessons yet.
              </p>
              <Button variant="outline" onClick={() => navigate("/learn")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          lessons.map((lesson, index) => {
            const lessonProgress = progressMap[lesson.lessonId];
            const isCompleted = lessonProgress?.status === "completed";
            const isStarted = lessonProgress?.status === "in_progress";
            const isLocked =
              index > 0 && !progressMap[lessons[index - 1].lessonId];

            return (
              <LessonCard
                key={lesson.lessonId}
                lesson={lesson}
                progress={lessonProgress}
                isCompleted={isCompleted}
                isStarted={isStarted}
                isLocked={isLocked}
                onLessonClick={() =>
                  navigate(`/learn/lesson/${lesson.lessonId}`)
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({
  lesson,
  progress,
  isCompleted,
  isStarted,
  isLocked,
  onLessonClick,
}: LessonCardProps): JSX.Element => {
  const accuracy = progress?.accuracy || 0;

  return (
    <Card
      className={`transition-all duration-200 ${
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:shadow-lg"
      } ${
        isCompleted
          ? "border-green-300 bg-green-50 dark:bg-green-900/10"
          : isStarted
          ? "border-purple-300 bg-purple-50 dark:bg-purple-900/10"
          : ""
      }`}
      onClick={isLocked ? undefined : onLessonClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`p-2 rounded-full ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isStarted
                  ? "bg-purple-500 text-white"
                  : isLocked
                  ? "bg-gray-300 text-gray-500"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {lesson.title}
                </h3>
                {isCompleted && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    Complete
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {lesson.titleHindi}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedTime || 7} min
                </span>

                {lesson.vocabulary && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {lesson.vocabulary.length} words
                  </span>
                )}

                {isCompleted && accuracy > 0 && (
                  <span
                    className={`font-semibold ${
                      accuracy >= 80
                        ? "text-green-600"
                        : accuracy >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {accuracy}% accuracy
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isLocked && (
            <Button variant={isCompleted ? "outline" : "default"} size="sm">
              {isCompleted ? "Review" : isStarted ? "Continue" : "Start"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitView;