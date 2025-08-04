// ts-client/src/pages/learner/LanguageDashboard.tsx

import { useGetUnitsQuery } from "@/features/api/freeLessonsApi";
import { useGetUserProgressQuery } from "@/features/api/userProgressApi";
import { useSelector } from "react-redux";
import { selectCurrentUnit } from "@/features/languageLearningSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Unit, UnitProgress } from "@/types";

interface UnitTitle {
  en: string;
  hi: string;
}

interface NextLesson {
  unitId: number;
  lessonId: string;
}

interface UnitCardProps {
  unit: Unit;
  progress?: UnitProgress;
  onUnitClick: () => void;
}

const LanguageDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const currentUnit = useSelector(selectCurrentUnit);

  // Fetch data using our new API hooks
  const {
    data: units,
    isLoading: unitsLoading,
    error: unitsError,
  } = useGetUnitsQuery();
  const { data: progress, isLoading: progressLoading } =
    useGetUserProgressQuery();

  if (unitsLoading || progressLoading) {
    return <LoadingSpinner />;
  }

  if (unitsError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Ayyoo..! कुछ गलत हुआ</h2>
          <p>Unable to load learning content. Please try again.</p>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const totalLessons =
    units?.reduce((sum, unit) => sum + (unit.totalLessons || 0), 0) || 0;
  const completedLessons = progress?.totalLessonsCompleted || 0;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next lesson to continue
  const getNextLesson = (): NextLesson | null => {
    if (!units || !progress) return null;

    // Simple logic: first incomplete lesson in order
    for (const unit of units) {
      const unitProgress = progress.unitProgress?.find(
        (up) => up.unitId === unit.unitId
      );
      const completedInUnit = unitProgress?.completed || 0;

      if (completedInUnit < unit.totalLessons) {
        return {
          unitId: unit.unitId,
          lessonId: `${unit.unitId}.${completedInUnit + 1}`,
        };
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Hindi से English सीखें
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your personalized English learning journey
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Overall Progress</p>
                <p className="text-2xl font-bold">{overallProgress}%</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Lessons Completed</p>
                <p className="text-2xl font-bold">
                  {completedLessons}/{totalLessons}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Time Spent</p>
                <p className="text-2xl font-bold">
                  {Math.round((progress?.totalTimeSpent || 0) / 60)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      {nextLesson && (
        <Card className="mb-8 border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Play className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Next: Lesson {nextLesson.lessonId}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unit {nextLesson.unitId} • Ready to start
                </p>
              </div>
              <Button
                onClick={() => navigate(`/learn/lesson/${nextLesson.lessonId}`)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units?.map((unit) => (
          <UnitCard
            key={unit.unitId}
            unit={unit}
            progress={progress?.unitProgress?.find(
              (up) => up.unitId === unit.unitId
            )}
            onUnitClick={() => navigate(`/learn/unit/${unit.unitId}`)}
          />
        ))}
      </div>
    </div>
  );
};

// Unit Card Component
const UnitCard = ({ unit, progress, onUnitClick }: UnitCardProps): JSX.Element => {
  const completedLessons = progress?.completed || 0;
  const totalLessons = unit.totalLessons || 0;
  const unitProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const getUnitTitle = (unitId: number): UnitTitle => {
    const titles: Record<number, UnitTitle> = {
      1: { en: "Basic Greetings", hi: "बुनियादी अभिवादन" },
      2: { en: "Numbers & Time", hi: "संख्याएं और समय" },
      3: { en: "Family & Relations", hi: "परिवार और रिश्ते" },
    };
    return titles[unitId] || { en: `Unit ${unitId}`, hi: `इकाई ${unitId}` };
  };

  const unitTitle = getUnitTitle(unit.unitId);
  const isCompleted = completedLessons === totalLessons;
  const isStarted = completedLessons > 0;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isCompleted
          ? "border-green-300 bg-green-50 dark:bg-green-900/10"
          : isStarted
          ? "border-purple-300 bg-purple-50 dark:bg-purple-900/10"
          : "hover:border-gray-300"
      }`}
      onClick={onUnitClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Unit {unit.unitId}</CardTitle>
          {isCompleted && (
            <Badge variant="default" className="bg-green-500">
              <Trophy className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {unitTitle.en}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unitTitle.hi}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-semibold">
              {completedLessons}/{totalLessons} lessons
            </span>
          </div>

          <Progress value={unitProgress} className="h-2" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {unitProgress}% complete
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageDashboard;