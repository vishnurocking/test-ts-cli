// ts-client/src/components/ApiIntegrationTest.tsx
// Component to test API integration with TypeScript backend

import { useGetPublishedCourseQuery } from "@/features/api/publicApi";
import { useGetActiveLessonsQuery } from "@/features/api/freeLessonsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const ApiIntegrationTest = (): JSX.Element => {
  // Test published courses API
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetPublishedCourseQuery();

  // Test active lessons API (new TypeScript endpoint)
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useGetActiveLessonsQuery();


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">API Integration Test</h1>
        <p className="text-muted-foreground">
          Testing TypeScript backend integration with frontend
        </p>
      </div>

      {/* Published Courses Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Published Courses API</span>
            {coursesLoading ? (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            ) : coursesError ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : coursesError ? (
            <div className="text-red-600">
              Error: {JSON.stringify(coursesError)}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  Response has 'success' field:{" "}
                  <Badge variant={coursesData?.success ? "default" : "secondary"}>
                    {coursesData?.success ? "Yes" : "No"}
                  </Badge>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  Courses in 'data' field:{" "}
                  <Badge>{coursesData?.data?.length || 0}</Badge>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  API Success:{" "}
                  <Badge variant={coursesData?.success ? "default" : "destructive"}>
                    {coursesData?.success ? "Yes" : "No"}
                  </Badge>
                </span>
              </div>
              {coursesData?.data?.[0] && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">First Course:</p>
                  <div className="text-xs space-y-1">
                    <div>
                      Title: {coursesData.data[0].courseTitle}
                    </div>
                    <div>
                      isPublished type:{" "}
                      <Badge
                        variant={
                          typeof coursesData.data[0].isPublished === "boolean"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {typeof coursesData.data[0].isPublished}
                      </Badge>
                    </div>
                    <div>
                      Price: ₹{coursesData.data[0].coursePrice}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Lessons Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Lessons API (New)</span>
            {lessonsLoading ? (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            ) : lessonsError ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessonsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : lessonsError ? (
            <div className="text-red-600">
              Error: {JSON.stringify(lessonsError)}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  Response has 'success' field:{" "}
                  <Badge variant={lessonsData?.success ? "default" : "secondary"}>
                    {lessonsData?.success ? "Yes" : "No"}
                  </Badge>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  Lessons count:{" "}
                  <Badge>{lessonsData?.data?.length || 0}</Badge>
                </span>
              </div>
              {lessonsData?.data?.[0] && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">First Lesson:</p>
                  <div className="text-xs space-y-1">
                    <div>Title: {lessonsData.data[0].title}</div>
                    <div>Difficulty: {lessonsData.data[0].difficulty}</div>
                    <div>
                      Estimated Time: {lessonsData.data[0].estimatedTime} min
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Summary */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {coursesData?.success && typeof coursesData?.data?.[0]?.isPublished === "boolean" ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span>TypeScript backend detected (boolean isPublished)</span>
            </div>
            <div className="flex items-center gap-2">
              {lessonsData?.success && lessonsData?.data ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span>New active lessons endpoint working</span>
            </div>
            <div className="flex items-center gap-2">
              {coursesData?.data && lessonsData?.data ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span>Backward compatibility maintained</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrationTest;