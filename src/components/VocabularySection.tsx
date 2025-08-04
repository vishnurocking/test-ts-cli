// ts-client/src/components/VocabularySection.tsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Volume2, Eye, EyeOff } from "lucide-react";

interface VocabularyItem {
  english: string;
  hindi: string;
  pronunciation?: string;
  example?: string;
}

interface VocabularySectionProps {
  vocabulary: VocabularyItem[];
  onComplete: () => void;
}

const VocabularySection: React.FC<VocabularySectionProps> = ({ vocabulary, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showHindi, setShowHindi] = useState<boolean>(true);
  const [viewedAll, setViewedAll] = useState<boolean>(false);

  const currentVocab = vocabulary[currentIndex];

  const handleNext = (): void => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // FIX: When reaching the end, mark as viewedAll instead of auto-transitioning
      setViewedAll(true);
    }
  };

  const handlePrevious = (): void => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const speakWord = (text: string): void => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Vocabulary</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Learn these words before starting exercises
        </p>
      </div>

      {/* Vocabulary Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Word {currentIndex + 1} of {vocabulary.length}
            </CardTitle>
            <Badge variant="outline">
              {Math.round(((currentIndex + 1) / vocabulary.length) * 100)}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* English Word */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {currentVocab.english}
              </h3>
              <Button
                variant="outline"
                size="icon"
                onClick={() => speakWord(currentVocab.english)}
                className="rounded-full"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Pronunciation */}
            {currentVocab.pronunciation && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                /{currentVocab.pronunciation}/
              </p>
            )}
          </div>

          {/* Hindi Translation */}
          <div className="text-center border-t pt-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h4 className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {showHindi ? currentVocab.hindi : "•••••"}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHindi(!showHindi)}
              >
                {showHindi ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Example */}
          {currentVocab.example && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Example:
              </p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {currentVocab.example}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {vocabulary.length}
            </div>

            {/* FIX: Correct button logic */}
            {currentIndex === vocabulary.length - 1 ? (
              <Button
                onClick={() => setViewedAll(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Finish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* FIX: Start Exercises button appears after Finish is clicked */}
          {viewedAll && (
            <div className="mt-6 text-center">
              <Button
                onClick={onComplete}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Start Exercises
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Words Overview */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">All Vocabulary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabulary.map((vocab, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                index === currentIndex
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {vocab.english}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vocab.hindi}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(vocab.english);
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Remove the completion card since we now use the button */}
    </div>
  );
};

export default VocabularySection;