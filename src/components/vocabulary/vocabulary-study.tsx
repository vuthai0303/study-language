"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VocabularyType } from "@/types";

interface VocabularyStudyProps {
  vocabulary: VocabularyType[];
}

type QuizQuestion = {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
};

type QuizResult = {
  total: number;
  correct: number;
  incorrect: number;
};

export function VocabularyStudy({ vocabulary }: VocabularyStudyProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<QuizResult>({ total: 0, correct: 0, incorrect: 0 });

  const generateQuiz = () => {
    if (vocabulary.length < 4) {
      alert("Bạn cần có ít nhất 4 từ vựng để bắt đầu học!");
      return;
    }

    // Shuffle vocabulary and take up to 10 items
    const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
    const selectedVocabulary = shuffled.slice(0, Math.min(10, shuffled.length));

    // Generate questions
    const generatedQuestions = selectedVocabulary.map((item) => {
      // Get 3 random incorrect options
      const incorrectOptions = vocabulary
        .filter((v) => v.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((v) => v.meaning);

      // Combine correct and incorrect options and shuffle
      const options = [item.meaning, ...incorrectOptions].sort(() => 0.5 - Math.random());

      return {
        id: item.id,
        word: item.word,
        correctAnswer: item.meaning,
        options,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizStarted(true);
    setQuizFinished(false);
    setResult({ total: generatedQuestions.length, correct: 0, incorrect: 0 });
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    // Update result
    const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
    setResult((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
  };

  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Học từ vựng</h2>
        <p className="text-center mb-6">
          Bắt đầu bài kiểm tra trắc nghiệm để kiểm tra kiến thức từ vựng của bạn.
        </p>
        <Button onClick={generateQuiz} disabled={vocabulary.length < 4}>
          Bắt đầu học
        </Button>
        {vocabulary.length < 4 && (
          <p className="text-sm text-muted-foreground mt-2">
            Bạn cần có ít nhất 4 từ vựng để bắt đầu học.
          </p>
        )}
      </div>
    );
  }

  if (quizFinished) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Kết quả</CardTitle>
          <CardDescription>Bạn đã hoàn thành bài kiểm tra!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">
                {result.correct}/{result.total}
              </p>
              <p className="text-muted-foreground">Số câu trả lời đúng</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">{result.correct}</p>
                <p className="text-muted-foreground">Đúng</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{result.incorrect}</p>
                <p className="text-muted-foreground">Sai</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuiz} className="w-full">Học lại</Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Câu hỏi {currentQuestionIndex + 1}/{questions.length}</CardTitle>
        <CardDescription>Chọn nghĩa đúng của từ vựng sau</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-center">{currentQuestion.word}</h3>
        </div>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={
                isAnswered
                  ? option === currentQuestion.correctAnswer
                    ? "default"
                    : option === selectedOption
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className="w-full justify-start text-left"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetQuiz}>
          Thoát
        </Button>
        <Button onClick={handleNextQuestion} disabled={!isAnswered}>
          {currentQuestionIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
        </Button>
      </CardFooter>
    </Card>
  );
}