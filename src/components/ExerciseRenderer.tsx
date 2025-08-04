// ts-client/src/components/ExerciseRenderer.tsx

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  PenTool,
  MessageSquare,
  Users,
} from "lucide-react";

interface Exercise {
  exerciseId: string;
  type: "multiple_choice" | "fill_blank" | "translation" | "scenario_response";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hint?: string;
  sentence?: string;
  hindiText?: string;
  scenario?: string;
}

interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
  timeSpent: number;
}

interface ExerciseRendererProps {
  exercise: Exercise;
  onExerciseComplete: (result: ExerciseResult) => void;
}

interface ExerciseComponentProps {
  exercise: Exercise;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  showFeedback: boolean;
}

interface FeedbackSectionProps {
  exercise: Exercise;
  isCorrect: boolean;
  userAnswer: string;
  timeSpent: number;
}

const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ exercise, onExerciseComplete }) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  // Reset state when exercise changes
  useEffect(() => {
    setUserAnswer("");
    setShowFeedback(false);
    setIsCorrect(false);
    setTimeSpent(0);
  }, [exercise.exerciseId]);

  const handleSubmit = (): void => {
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    setTimeSpent(totalTime);

    let correct = false;

    // Check answer based on exercise type
    if (
      exercise.type === "multiple_choice" ||
      exercise.type === "translation" ||
      exercise.type === "scenario_response"
    ) {
      correct = userAnswer === exercise.correctAnswer;
    } else if (exercise.type === "fill_blank") {
      correct =
        userAnswer.toLowerCase().trim() ===
        exercise.correctAnswer.toLowerCase().trim();
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Send result to parent component
    onExerciseComplete({
      exerciseId: exercise.exerciseId,
      correct,
      userAnswer,
      timeSpent: totalTime,
    });
  };

  const getExerciseIcon = (): JSX.Element => {
    switch (exercise.type) {
      case "multiple_choice":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "fill_blank":
        return <PenTool className="h-5 w-5 text-green-600" />;
      case "translation":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case "scenario_response":
        return <Users className="h-5 w-5 text-indigo-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-600" />;
    }
  };

  const getExerciseTypeLabel = (): string => {
    switch (exercise.type) {
      case "multiple_choice":
        return "Choose the correct answer";
      case "fill_blank":
        return "Fill in the blank";
      case "translation":
        return "Choose the best translation";
      case "scenario_response":
        return "Respond to the situation";
      default:
        return "Complete the exercise";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          {getExerciseIcon()}
          <span className="text-blue-800 dark:text-blue-200">
            {getExerciseTypeLabel()}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Exercise Content Based on Type */}
        {exercise.type === "multiple_choice" && (
          <MultipleChoiceExercise
            exercise={exercise}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showFeedback={showFeedback}
          />
        )}

        {exercise.type === "fill_blank" && (
          <FillBlankExercise
            exercise={exercise}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showFeedback={showFeedback}
          />
        )}

        {exercise.type === "translation" && (
          <TranslationExercise
            exercise={exercise}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showFeedback={showFeedback}
          />
        )}

        {exercise.type === "scenario_response" && (
          <ScenarioResponseExercise
            exercise={exercise}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showFeedback={showFeedback}
          />
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Answer
            </Button>
          </div>
        )}

        {/* Feedback Section */}
        {showFeedback && (
          <FeedbackSection
            exercise={exercise}
            isCorrect={isCorrect}
            userAnswer={userAnswer}
            timeSpent={timeSpent}
          />
        )}
      </CardContent>
    </Card>
  );
};

// UPDATED: Multiple Choice with smart grid layout
const MultipleChoiceExercise: React.FC<ExerciseComponentProps> = ({
  exercise,
  userAnswer,
  setUserAnswer,
  showFeedback,
}) => {
  const { options = [] } = exercise;

  // Smart grid layout: 2x2 for ≤4 options, dynamic for 5+
  const gridLayout =
    options.length <= 4
      ? "grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
        <p className="text-lg text-blue-800 dark:text-blue-200 font-medium">
          {exercise.question}
        </p>
      </div>

      {/* Options Grid */}
      <div className={`grid ${gridLayout} gap-3`}>
        {options.map((option, index) => (
          <Button
            key={index}
            variant={
              showFeedback
                ? option === exercise.correctAnswer
                  ? "default"
                  : option === userAnswer
                  ? "destructive"
                  : "outline"
                : userAnswer === option
                ? "default"
                : "outline"
            }
            onClick={() => !showFeedback && setUserAnswer(option)}
            disabled={showFeedback}
            className="p-4 h-auto text-left justify-start whitespace-normal min-h-[3rem]"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

// UPDATED: Fill Blank supporting both 'sentence' and 'question' properties
const FillBlankExercise: React.FC<ExerciseComponentProps> = ({
  exercise,
  userAnswer,
  setUserAnswer,
  showFeedback,
}) => {
  // Support both 'sentence' and 'question' properties from data structure
  const promptText = exercise.sentence || exercise.question || "";
  const hasBlank = promptText.includes("_____");

  return (
    <div className="space-y-4">
      {/* Question/Sentence with blank */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
        <p className="text-lg text-green-800 dark:text-green-200 font-medium">
          {hasBlank
            ? promptText.split("_____").map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="mx-2 px-3 py-1 bg-white border-2 border-dashed border-green-400 rounded inline-block min-w-[120px] text-center">
                      {showFeedback ? userAnswer || "____" : "____"}
                    </span>
                  )}
                </span>
              ))
            : promptText}
        </p>
      </div>

      {/* Hint */}
      {exercise.hint && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {exercise.hint}
          </p>
        </div>
      )}

      {/* Input field or options */}
      {exercise.options &&
      Array.isArray(exercise.options) &&
      exercise.options.length > 0 ? (
        <div
          className={`grid ${
            exercise.options.length <= 4
              ? "grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2"
          } gap-3`}
        >
          {exercise.options.map((option, index) => (
            <Button
              key={index}
              variant={userAnswer === option ? "default" : "outline"}
              onClick={() => !showFeedback && setUserAnswer(option)}
              disabled={showFeedback}
              className="p-3 h-auto"
            >
              {option}
            </Button>
          ))}
        </div>
      ) : (
        <Input
          type="text"
          placeholder="Type your answer here..."
          value={userAnswer}
          onChange={(e) => !showFeedback && setUserAnswer(e.target.value)}
          disabled={showFeedback}
          className="text-lg p-3"
        />
      )}
    </div>
  );
};

// UPDATED: Translation Exercise with options array support
const TranslationExercise: React.FC<ExerciseComponentProps> = ({
  exercise,
  userAnswer,
  setUserAnswer,
  showFeedback,
}) => {
  const { options = [] } = exercise;

  return (
    <div className="space-y-4">
      {/* Hindi text to translate */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
        <p className="text-sm text-purple-600 dark:text-purple-400 mb-2 font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Translate this to English:
        </p>
        <p className="text-xl text-purple-800 dark:text-purple-200 font-semibold">
          {exercise.hindiText}
        </p>
      </div>

      {/* Hint */}
      {exercise.hint && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded dark:bg-amber-900/20 dark:border-amber-700">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {exercise.hint}
          </p>
        </div>
      )}

      {/* Translation Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <Button
            key={index}
            variant={
              showFeedback
                ? option === exercise.correctAnswer
                  ? "default"
                  : option === userAnswer
                  ? "destructive"
                  : "outline"
                : userAnswer === option
                ? "default"
                : "outline"
            }
            onClick={() => !showFeedback && setUserAnswer(option)}
            disabled={showFeedback}
            className="w-full p-4 h-auto text-left justify-start whitespace-normal"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Scenario Response Exercise
const ScenarioResponseExercise: React.FC<ExerciseComponentProps> = ({
  exercise,
  userAnswer,
  setUserAnswer,
  showFeedback,
}) => {
  const { options = [] } = exercise;

  const gridLayout =
    options.length <= 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="space-y-4">
      {/* Scenario */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg dark:from-indigo-900/20 dark:to-blue-900/20 dark:border-indigo-700">
        <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2 font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Situation:
        </p>
        <p className="text-lg text-indigo-800 dark:text-indigo-200 font-medium mb-3">
          {exercise.scenario}
        </p>
        <p className="text-base text-indigo-700 dark:text-indigo-300">
          {exercise.question}
        </p>
      </div>

      {/* Response Options */}
      <div className={`grid ${gridLayout} gap-3`}>
        {options.map((option, index) => (
          <Button
            key={index}
            variant={
              showFeedback
                ? option === exercise.correctAnswer
                  ? "default"
                  : option === userAnswer
                  ? "destructive"
                  : "outline"
                : userAnswer === option
                ? "default"
                : "outline"
            }
            onClick={() => !showFeedback && setUserAnswer(option)}
            disabled={showFeedback}
            className="p-4 h-auto text-left justify-start whitespace-normal min-h-[3rem]"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

// UPDATED: Feedback with calming colors
const FeedbackSection: React.FC<FeedbackSectionProps> = ({ exercise, isCorrect, userAnswer, timeSpent }) => {
  return (
    <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
      <div className="flex items-start gap-3">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        )}

        <div className="flex-1">
          <p
            className={`font-semibold ${
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {isCorrect ? "बहुत बढ़िया! Excellent!" : "अच्छी कोशिश! Good try!"}
          </p>

          {!isCorrect && (
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Correct answer: <strong>{exercise.correctAnswer}</strong>
            </p>
          )}

          {exercise.explanation && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {exercise.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Time taken: {timeSpent} seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseRenderer;