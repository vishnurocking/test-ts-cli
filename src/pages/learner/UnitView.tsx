// ts-client/src/pages/learner/UnitView.tsx
// Updated to use active lessons filtered by unitId - TypeScript only

import { useParams, useNavigate } from "react-router-dom";
import { useGetActiveLessonsQuery } from "@/features/api/freeLessonsApi";
import { useGetUserProgressQuery } from "@/features/api/userProgressApi";
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
import type { FreeLesson } from "@/types";

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
  isCompleted: boolean;
  isStarted: boolean;
  isLocked: boolean;
  onLessonClick: () => void;
}

const UnitView = (): JSX.Element => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  // Get all active lessons and filter by unitId
  const {
    data: allLessons,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useGetActiveLessonsQuery();
  
  const { data: progressData, isLoading: progressLoading } =
    useGetUserProgressQuery();

  if (lessonsLoading || progressLoading) {
    return <LoadingSpinner />;
  }

  if (lessonsError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Loading Unit</h2>
          <p>Unable to load unit content. Please try again.</p>
          <Button
            onClick={() => navigate("/learn")}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Filter lessons for this unit
  const unitLessons = allLessons?.filter(lesson => lesson.unitId === unitId) || [];

  if (unitLessons.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unit Not Found</h2>
          <p className="text-gray-600 mb-4">
            No lessons found for Unit {unitId}. This unit might not exist or have no active lessons.
          </p>
          <Button
            onClick={() => navigate("/learn")}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Sort lessons by lesson order
  const sortedLessons = unitLessons.sort((a, b) => a.lessonOrder - b.lessonOrder);

  // Get unit info from first lesson or use defaults
  const unitInfo: UnitInfo = getUnitInfo(unitId || "1");

  // Calculate progress
  const totalLessons = sortedLessons.length;
  const completedLessons = sortedLessons.filter(lesson =>
    progressData?.completedLessons?.includes(lesson.lessonId)
  ).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next lesson to start
  const nextLesson = sortedLessons.find(lesson =>
    !progressData?.completedLessons?.includes(lesson.lessonId)
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate("/learn")}
          variant="ghost"
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${unitInfo.color}`}>
            <unitInfo.icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {unitInfo.title}
            </h1>
            <p className="text-lg text-purple-600 dark:text-purple-400 mb-2">
              {unitInfo.titleHindi}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {unitInfo.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unitInfo.descriptionHindi}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Unit Progress</h3>
              <p className="text-sm text-gray-600">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {progressPercentage}%
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Continue Learning */}
      {nextLesson && (
        <Card className="mb-6 border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Play className="w-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{nextLesson.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {nextLesson.estimatedTime} minutes • {nextLesson.difficulty}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/learn/lesson/${nextLesson.lessonId}`)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Start Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lessons</h2>
        {sortedLessons.map((lesson, index) => {
          const isCompleted = progressData?.completedLessons?.includes(lesson.lessonId) || false;
          const isStarted = progressData?.startedLessons?.includes(lesson.lessonId) || false;
          const isLocked = index > 0 && !progressData?.completedLessons?.includes(sortedLessons[index - 1].lessonId);

          return (
            <LessonCard
              key={lesson.lessonId}
              lesson={lesson}
              isCompleted={isCompleted}
              isStarted={isStarted}
              isLocked={isLocked}
              onLessonClick={() => navigate(`/learn/lesson/${lesson.lessonId}`)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({
  lesson,
  isCompleted,
  isStarted,
  isLocked,
  onLessonClick,
}: LessonCardProps): JSX.Element => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isLocked ? 'opacity-50 cursor-not-allowed' : ''
      } ${isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}`}
      onClick={isLocked ? undefined : onLessonClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : isStarted ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{lesson.lessonOrder}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimatedTime} min</span>
              </div>
              <Badge variant="secondary" className={getDifficultyColor(lesson.difficulty)}>
                {lesson.difficulty}
              </Badge>
              {lesson.vocabulary && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{lesson.vocabulary.length} words</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Unit information helper
const getUnitInfo = (unitId: string): UnitInfo => {
  const unitMap: Record<string, UnitInfo> = {
    "1": {
      title: "Unit 1: Basic Greetings",
      titleHindi: "यूनिट 1: बुनियादी अभिवादन",
      description: "Learn essential greetings and introductions in English",
      descriptionHindi: "अंग्रेजी में आवश्यक अभिवादन और परिचय सीखें",
      icon: Users,
      color: "bg-blue-500",
    },
    "2": {
      title: "Unit 2: Daily Conversations",
      titleHindi: "यूनिट 2: दैनिक बातचीत",
      description: "Master everyday conversations and common phrases",
      descriptionHindi: "रोजमर्रा की बातचीत और सामान्य वाक्यों में महारत हासिल करें",
      icon: Target,
      color: "bg-green-500",
    },
    "3": {
      title: "Unit 3: Advanced Topics",
      titleHindi: "यूनिट 3: उन्नत विषय",
      description: "Explore complex topics and advanced vocabulary",
      descriptionHindi: "जटिल विषयों और उन्नत शब्दावली का अन्वेषण करें",
      icon: BookOpen,
      color: "bg-purple-500",
    },
  };

  return unitMap[unitId] || {
    title: `Unit ${unitId}`,
    titleHindi: `यूनिट ${unitId}`,
    description: "Language learning unit",
    descriptionHindi: "भाषा सीखने की इकाई",
    icon: BookOpen,
    color: "bg-gray-500",
  };
};

export default UnitView;