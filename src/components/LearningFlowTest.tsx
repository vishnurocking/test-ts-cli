// ts-client/src/components/LearningFlowTest.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, ArrowRight } from "lucide-react";

interface TestStep {
  id: string;
  title: string;
  description: string;
  path: string;
  action: string;
}

const LearningFlowTest = (): JSX.Element => {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const testSteps: TestStep[] = [
    {
      id: "dashboard",
      title: "Language Dashboard",
      description: "View learning progress and units",
      path: "/learn",
      action: "Visit Dashboard",
    },
    {
      id: "unit",
      title: "Unit Overview",
      description: "Browse lessons in Unit 1",
      path: "/learn/unit/1",
      action: "View Unit 1",
    },
    {
      id: "lesson",
      title: "Take Lesson",
      description: "Complete Lesson 1.1 with exercises",
      path: "/learn/lesson/1.1",
      action: "Start Lesson 1.1",
    },
    {
      id: "navigation",
      title: "Mobile Navigation",
      description: "Test mobile responsive navigation",
      path: "/learn",
      action: "Test Mobile Nav",
    },
  ];

  const markStepCompleted = (stepId: string): void => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const allStepsCompleted = completedSteps.length === testSteps.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Language Learning Flow Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the complete user journey through the language learning
          experience
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Test Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {completedSteps.length} of {testSteps.length} steps completed
              </p>
            </div>
            {allStepsCompleted && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                All Tests Passed!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Steps */}
      <div className="space-y-4">
        {testSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);

          return (
            <Card
              key={step.id}
              className={`transition-all ${
                isCompleted
                  ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(step.path)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {step.action}
                    </Button>

                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => markStepCompleted(step.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Step 1:</strong> Visit dashboard - Check if units and
              progress display correctly
            </p>
            <p>
              <strong>Step 2:</strong> View unit - Verify lesson list and
              navigation work
            </p>
            <p>
              <strong>Step 3:</strong> Take lesson - Complete vocabulary and
              exercises, check progress tracking
            </p>
            <p>
              <strong>Step 4:</strong> Test mobile - Resize browser or use
              mobile device to test responsive design
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {allStepsCompleted && (
        <Card className="mt-6 border-green-300 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Day 4 Frontend Foundation Complete! 🎉
            </h3>
            <p className="text-green-600 dark:text-green-300 mb-4">
              Language learning interface is working perfectly!
            </p>
            <Button
              onClick={() => navigate("/learn")}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Language Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningFlowTest;