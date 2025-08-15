"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VocabularyType, QuizResult, WritingQuestion } from "@/types";
import { updateVocabulary } from "@/lib/localStorage";
import { isEmpty } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface VocabularyWritingStudyProps {
  vocabulary: VocabularyType[];
  selectedStatus: VocabularyType["status"];
  quizStarted: boolean;
  onRefresh: () => void;
  startQuiz: () => void;
  onCloseQuiz: () => void;
}

// Randomly select at least 1 character, approximately 1/5 of the total number of characters (rounded up).
function getRandomRevealedIndexes(word: string): number[] {
  if (!word) return [];

  const getIndexesOfChar = (str: string, ch: string): number[] =>
    str
      .split("")
      .reduce<number[]>(
        (acc, c, i) => (c === ch ? (acc.push(i), acc) : acc),
        []
      );

  const indexes: number[] = [0, ...getIndexesOfChar(word, " ")];
  const revealCount = Math.max(1, Math.ceil(word.length / 5)) + indexes.length;
  while (indexes.length < revealCount) {
    const idx = Math.floor(Math.random() * word.length);
    if (!indexes.includes(idx)) {
      indexes.push(idx);
    }
  }
  return indexes;
}

export function VocabularyWritingStudy({
  vocabulary,
  selectedStatus,
  quizStarted,
  onRefresh,
  startQuiz,
  onCloseQuiz,
}: VocabularyWritingStudyProps) {
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>();
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [correctIndexes, setCorrectIndexes] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<QuizResult>({
    total: 0,
    correct: 0,
    incorrect: 0,
  });

  // Create quiz
  useEffect(() => {
    if (!quizStarted) return;
    const generatedQuestions = vocabulary.map((item) => ({
      id: item.id,
      word: item.word,
      meaning: item.meaning,
      type: item.type,
    }));
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setResult({
      total: generatedQuestions.length,
      correct: 0,
      incorrect: 0,
    });
    if (generatedQuestions.length > 0) {
      const word = generatedQuestions[0].word;
      const revealed = getRandomRevealedIndexes(word);
      setRevealedIndexes(revealed);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(null);
    }
  }, [quizStarted, vocabulary]);

  // Reset state when change question
  useEffect(() => {
    if (questions.length === 0 || quizFinished) return;
    const word = questions[currentQuestionIndex]?.word;
    if (!word) return;
    const revealed = getRandomRevealedIndexes(word);
    setRevealedIndexes(revealed);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(null);
  }, [currentQuestionIndex, questions, quizFinished]);

  const checkCorrectIndexes = () => {
    if (isAnswered || !userAnswer) return;

    const result: number[] = [];
    const word: string[] =
      (questions[currentQuestionIndex].word ?? "").split("") ?? [];

    (userAnswer ?? "").split("").map((e, idx: number) => {
      if (userAnswer[idx] == word[idx]) result.push(idx);
    });
    setCorrectIndexes(result);
  };

  const handleCheckAnswer = () => {
    if (isAnswered || !userAnswer) return;
    const word = questions[currentQuestionIndex].word ?? "";
    const correct = userAnswer?.toLowerCase() === word.toLowerCase();
    setIsAnswered(true);
    setIsCorrect(correct);
    setResult((prev) => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));
    checkCorrectIndexes();

    // If quiz is on "mastered" and answer is incorrect, move word to "learning", quiz is on "learning" move word to "to_learn"
    if (!correct && selectedStatus != "to_learn") {
      const wordId = questions[currentQuestionIndex].id;
      const wordObj = vocabulary.find((v) => v.id === wordId);
      if (wordObj) {
        updateVocabulary({
          ...wordObj,
          status: wordObj.status === "mastered" ? "learning" : "to_learn",
        });
        onRefresh();
      }
    }

    // If quiz is on "to_learn" and answer is correct, move word to "learning", quiz is on "learning" move word to "mastered"
    if (correct && selectedStatus != "mastered") {
      const wordId = questions[currentQuestionIndex].id;
      const wordObj = vocabulary.find((v) => v.id === wordId);
      if (wordObj) {
        updateVocabulary({
          ...wordObj,
          status: wordObj.status == "to_learn" ? "learning" : "mastered",
        });
        onRefresh();
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

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
                <p className="text-2xl font-bold text-green-500">
                  {result.correct}
                </p>
                <p className="text-muted-foreground">Đúng</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {result.incorrect}
                </p>
                <p className="text-muted-foreground">Sai</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full justify-center items-center flex flex-row flex-wrap gap-2">
            <Button onClick={startQuiz} className="w-fit">
              Học lại
            </Button>
            <Button onClick={onCloseQuiz} className="w-fit">
              Kết thúc
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Không có từ vựng</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Không tìm thấy từ vựng nào để luyện tập.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onCloseQuiz}>Thoát</Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-fit max-w-3/4 min-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          Câu hỏi {currentQuestionIndex + 1}/{questions.length}
        </CardTitle>
        <CardDescription>
          Điền các ký tự còn thiếu của từ vựng tiếng Anh dựa vào nghĩa bên dưới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {currentQuestion.word.split("").map((char, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              className={`w-10 h-12 text-center text-xl border rounded ${
                isAnswered && correctIndexes.includes(idx)
                  ? "bg-green-200 text-black font-bold"
                  : isAnswered
                  ? "bg-red-200 text-black font-bold"
                  : revealedIndexes.includes(idx)
                  ? "bg-gray-200 text-black font-bold"
                  : "bg-white"
              }`}
              value={revealedIndexes.includes(idx) || isAnswered ? char : ""}
              disabled={true}
              autoComplete="off"
            />
          ))}
        </div>
        <div className="mb-4 text-center">
          <span className="text-muted-foreground text-lg">
            ({currentQuestion.type}) {currentQuestion.meaning}
          </span>
        </div>
        <div className="mb-4 text-center">
          <Input
            placeholder="Nhập kết quả"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswered}
          />
        </div>
        {isAnswered && (
          <div className="text-center mb-2">
            {isCorrect ? (
              <span className="text-green-600 font-semibold">Chính xác!</span>
            ) : (
              <span className="text-red-600 font-semibold">
                Sai! Đáp án đúng:{" "}
                <span className="underline">{currentQuestion.word}</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCloseQuiz}>
          Thoát
        </Button>
        {!isAnswered ? (
          <Button onClick={handleCheckAnswer} disabled={isEmpty(userAnswer)}>
            Kiểm tra
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1
              ? "Tiếp theo"
              : "Xem kết quả"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
