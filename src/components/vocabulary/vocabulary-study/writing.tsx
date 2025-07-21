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
import { VocabularyType, QuizResult } from "@/types";
import { updateVocabulary } from "@/lib/localStorage";

interface VocabularyWritingStudyProps {
  vocabulary: VocabularyType[];
  selectedStatus: VocabularyType["status"];
  quizStarted: boolean;
  onRefresh: () => void;
  startQuiz: () => void;
  onCloseQuiz: () => void;
}

type WritingQuestion = {
  id: string;
  word: string;
  meaning: string;
};

function getRandomRevealedIndexes(wordLength: number): number[] {
  // Lấy ngẫu nhiên ít nhất 1 ký tự, khoảng 1/5 số ký tự (làm tròn lên)
  const revealCount = Math.max(1, Math.ceil(wordLength / 5));
  const indexes: number[] = [];
  while (indexes.length < revealCount) {
    const idx = Math.floor(Math.random() * wordLength);
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
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<QuizResult>({
    total: 0,
    correct: 0,
    incorrect: 0,
  });

  // Khởi tạo quiz khi bắt đầu
  useEffect(() => {
    if (!quizStarted) return;
    const generatedQuestions = vocabulary.map((item) => ({
      id: item.id,
      word: item.word,
      meaning: item.meaning,
    }));
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setResult({
      total: generatedQuestions.length,
      correct: 0,
      incorrect: 0,
    });
    // Khởi tạo cho câu đầu tiên
    if (generatedQuestions.length > 0) {
      const word = generatedQuestions[0].word;
      const revealed = getRandomRevealedIndexes(word.length);
      setRevealedIndexes(revealed);
      setUserAnswer(
        word.split("").map((char, idx) => (revealed.includes(idx) ? char : ""))
      );
      setIsAnswered(false);
      setIsCorrect(null);
    }
  }, [quizStarted, vocabulary]);

  // Khi chuyển câu hỏi, reset state liên quan
  useEffect(() => {
    if (questions.length === 0 || quizFinished) return;
    const word = questions[currentQuestionIndex]?.word;
    if (!word) return;
    const revealed = getRandomRevealedIndexes(word.length);
    setRevealedIndexes(revealed);
    setUserAnswer(
      word.split("").map((char, idx) => (revealed.includes(idx) ? char : ""))
    );
    setIsAnswered(false);
    setIsCorrect(null);
  }, [currentQuestionIndex, questions, quizFinished]);

  const handleInputChange = (idx: number, value: string) => {
    if (isAnswered) return;
    if (!/^[a-zA-Z]?$/.test(value)) return; // Chỉ cho nhập 1 ký tự chữ
    setUserAnswer((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleCheckAnswer = () => {
    if (isAnswered) return;
    const word = questions[currentQuestionIndex].word;
    const answer = userAnswer.join("");
    const correct = answer.toLowerCase() === word.toLowerCase();
    setIsAnswered(true);
    setIsCorrect(correct);
    setResult((prev) => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));

    // Nếu quiz ở trạng thái "mastered" và trả lời sai, chuyển từ sang "learning"
    if (!correct && selectedStatus === "mastered") {
      const wordId = questions[currentQuestionIndex].id;
      const wordObj = vocabulary.find((v) => v.id === wordId);
      if (wordObj && wordObj.status === "mastered") {
        updateVocabulary({ ...wordObj, status: "learning" });
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
                revealedIndexes.includes(idx)
                  ? "bg-gray-200 text-black font-bold"
                  : "bg-white"
              }`}
              value={userAnswer[idx] || ""}
              disabled={revealedIndexes.includes(idx) || isAnswered}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              autoComplete="off"
            />
          ))}
        </div>
        <div className="mb-4 text-center">
          <span className="text-muted-foreground text-lg">
            {currentQuestion.meaning}
          </span>
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
          <Button
            onClick={handleCheckAnswer}
            disabled={userAnswer.some(
              (c, idx) => !revealedIndexes.includes(idx) && c.trim() === ""
            )}
          >
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
