// ts-client/src/pages/learner/LanguageDashboard.tsx
// Updated to use active lessons directly - TypeScript only

import { useGetActiveLessonsQuery } from "@/features/api/freeLessonsApi";
import { useGetUserProgressQuery } from "@/features/api/userProgressApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, ArrowRight, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FreeLesson } from "@/types";

interface LessonCardProps {
  lesson: FreeLesson;
  isCompleted?: boolean;
  onLessonClick: () => void;
}

const LanguageDashboard = (): JSX.Element => {
  const navigate = useNavigate();

  // Fetch active lessons directly
  const {
    data: lessons,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useGetActiveLessonsQuery();
  
  const { data: progress, isLoading: progressLoading } =
    useGetUserProgressQuery();

  if (lessonsLoading || progressLoading) {
    return <LoadingSpinner />;
  }

  if (lessonsError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Ayyoo..! कुछ गलत हुआ</h2>
          <p>Unable to load learning content. Please try again.</p>
        </div>
      </div>
    );
  }

  // Group lessons by unit for better organization
  const lessonsByUnit = lessons?.reduce((acc, lesson) => {
    const unitId = lesson.unitId || 'general';
    if (!acc[unitId]) {
      acc[unitId] = [];
    }
    acc[unitId].push(lesson);
    return acc;
  }, {} as Record<string, FreeLesson[]>) || {};

  // Calculate progress stats
  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.totalLessonsCompleted || 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next lesson (first incomplete lesson)
  const getNextLesson = (): FreeLesson | null => {
    if (!lessons || !progress) return null;
    
    // Sort lessons by lesson order and find first incomplete
    const sortedLessons = lessons.sort((a, b) => a.lessonOrder - b.lessonOrder);
    
    for (const lesson of sortedLessons) {
      const isCompleted = progress.completedLessons?.includes(lesson.lessonId);
      if (!isCompleted) {
        return lesson;
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <p className="font-semibold">{nextLesson.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {nextLesson.estimatedTime} minutes • {nextLesson.difficulty}
                </p>
                {nextLesson.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {nextLesson.description}
                  </p>
                )}
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

      {/* Lessons by Unit */}
      <div className="space-y-8">
        {Object.entries(lessonsByUnit).map(([unitId, unitLessons]) => (
          <div key={unitId}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Unit {unitId === 'general' ? 'General' : unitId}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitLessons.map((lesson) => (
                <LessonCard
                  key={lesson.lessonId}
                  lesson={lesson}
                  isCompleted={progress?.completedLessons?.includes(lesson.lessonId)}
                  onLessonClick={() => navigate(`/learn/lesson/${lesson.lessonId}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* If no lessons grouped by units, show all lessons */}
      {Object.keys(lessonsByUnit).length === 0 && lessons && lessons.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Available Lessons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.lessonId}
                lesson={lesson}
                isCompleted={progress?.completedLessons?.includes(lesson.lessonId)}
                onLessonClick={() => navigate(`/learn/lesson/${lesson.lessonId}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!lessons || lessons.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No lessons available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new learning content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({ lesson, isCompleted, onLessonClick }: LessonCardProps): JSX.Element => {
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
        isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''
      }`}
      onClick={onLessonClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm leading-tight">
            {lesson.title}
          </h3>
          {isCompleted && (
            <Star className="h-4 w-4 text-green-500 fill-current" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className={getDifficultyColor(lesson.difficulty)}>
            {lesson.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          <Clock className="h-3 w-3" />
          <span>{lesson.estimatedTime} min</span>
          {lesson.vocabulary && (
            <>
              <span>•</span>
              <span>{lesson.vocabulary.length} words</span>
            </>
          )}
        </div>
        
        {lesson.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {lesson.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageDashboard;