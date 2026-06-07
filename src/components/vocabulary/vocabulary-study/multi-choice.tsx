"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { updateLocalVocabulary } from "@/lib/localStorage";
import { QuizQuestion, QuizResult, StudyDirection, VocabularyType } from "@/types/vocabulary";
import { Speech } from "lucide-react";
import { useEffect, useState } from "react";

interface VocabularyMultiChoiceStudyProps {
  vocabulary: VocabularyType[];
  allVocabulary: VocabularyType[];
  direction: StudyDirection;
  quizStarted: boolean;
  onRefresh: () => void;
  startQuiz: () => void;
  onCloseQuiz: () => void;
}

/**
 * Handle level and status on correct answer (multi-choice: +1 level).
 * When level reaches 10 → promote status (to_learn → learning → mastered), reset level to 0.
 */
function handleCorrectAnswer(wordObj: VocabularyType): VocabularyType {
  const newLevel = (wordObj.level ?? 0) + 1;
  if (newLevel >= 10) {
    // Promote status
    const nextStatus: Record<VocabularyType["status"], VocabularyType["status"]> = {
      to_learn: "learning",
      learning: "mastered",
      mastered: "mastered",
    };
    return {
      ...wordObj,
      level: 0,
      status: nextStatus[wordObj.status],
    };
  }
  return { ...wordObj, level: newLevel };
}

/**
 * Handle level and status on incorrect answer (multi-choice: -2 level).
 * When level drops below 0 at learning/mastered → demote status, reset level to 5.
 */
function handleIncorrectAnswer(wordObj: VocabularyType): VocabularyType {
  const currentLevel = wordObj.level ?? 0;
  const newLevel = currentLevel - 2;
  if (newLevel < 0 && wordObj.status !== "to_learn") {
    // Demote status, reset level to 5
    const prevStatus: Record<VocabularyType["status"], VocabularyType["status"]> = {
      to_learn: "to_learn",
      learning: "to_learn",
      mastered: "learning",
    };
    return {
      ...wordObj,
      level: 5,
      status: prevStatus[wordObj.status],
    };
  }
  return { ...wordObj, level: Math.max(0, newLevel) };
}

export function VocabularyMultiChoiceStudy({
  vocabulary,
  allVocabulary,
  direction,
  quizStarted,
  onRefresh,
  startQuiz,
  onCloseQuiz,
}: VocabularyMultiChoiceStudyProps) {
  const { speak, isSupported } = useTextToSpeech();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<QuizResult>({
    total: 0,
    correct: 0,
    incorrect: 0,
  });
  const [isHiddenWord, setIsHiddenWord] = useState(true);

  useEffect(() => {
    // Generate questions - use allVocabulary for wrong options to ensure variety
    const optionPool = allVocabulary.length >= 4 ? allVocabulary : vocabulary;
    const generatedQuestions = vocabulary.map((item) => {
      // Get 3 random incorrect options from all vocabulary
      const incorrectOptions = optionPool
        .filter((v) => v.id !== item.id)
        .sort((a, b) => (a.type === item.type ? 0 : 1) - (b.type === item.type ? 0 : 1) || Math.random() - 0.5)
        .slice(0, 3);

      // Combine correct and incorrect options and shuffle
      const options = [item, ...incorrectOptions].sort(() => 0.5 - Math.random());

      if (direction === "en_to_vi") {
        // Question: English word → Answer: Vietnamese meaning
        return {
          id: item.id,
          word: item.word,                              // prompt shown to user
          correctAnswer: `(${item.type}) ${item.meaning}`,
          options,
        };
      } else {
        // Question: Vietnamese meaning → Answer: English word
        return {
          id: item.id,
          word: `(${item.type}) ${item.meaning}`,       // prompt shown to user
          correctAnswer: item.word,
          options,
        };
      }
    });

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
    setResult({ total: generatedQuestions.length, correct: 0, incorrect: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, vocabulary, direction]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
    setResult((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
    }));

    // Update vocabulary level based on answer correctness
    const wordId = questions[currentQuestionIndex].id;
    const wordObj = vocabulary.find((v) => v.id === wordId);
    if (wordObj) {
      if (isCorrect) {
        const updated = handleCorrectAnswer(wordObj);
        updateLocalVocabulary(updated);
      } else {
        const updated = handleIncorrectAnswer(wordObj);
        updateLocalVocabulary(updated);
      }
      onRefresh();
    }
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

  const currentQuestion = questions[currentQuestionIndex];

  // Helper to get option label text
  const getOptionLabel = (option: VocabularyType): string => {
    if (direction === "en_to_vi") {
      return `(${option.type}) ${option.meaning}`;
    } else {
      return option.word;
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex flex-row justify-between">
          <div>Câu hỏi {currentQuestionIndex + 1}/{questions.length}</div>
          {/* Switch only shown in en_to_vi direction */}
          {direction === "en_to_vi" && (
            <div className="flex items-center gap-2 text-sm font-normal">
              <Switch
                defaultChecked={!isHiddenWord}
                onCheckedChange={(checked) => setIsHiddenWord(!checked)}
              />
              Hiện từ vựng
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {direction === "en_to_vi"
            ? "Chọn nghĩa đúng của từ vựng tiếng Anh"
            : "Chọn từ tiếng Anh đúng với nghĩa tiếng Việt"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Prompt word/meaning */}
        <div className="mb-6 flex flex-row flex-wrap gap-2 justify-center items-center">
          {direction === "en_to_vi" ? (
            <>
              {/* English word: can be hidden, show on answer */}
              {(!isSupported || !isHiddenWord || isAnswered) && (
                <h3 className="text-2xl font-bold text-center">
                  {currentQuestion?.word}
                </h3>
              )}
              {isSupported && (
                <Button
                  onClick={() => speak(currentQuestion?.word)}
                  variant="outline"
                  size="icon"
                >
                  <Speech />
                </Button>
              )}
            </>
          ) : (
            /* Vietnamese meaning: always shown, no voice */
            <h3 className="text-xl font-semibold text-center text-primary">
              {currentQuestion?.word}
            </h3>
          )}
        </div>

        {/* Answer options */}
        <div className="space-y-2">
          {currentQuestion?.options?.map((option, index) => {
            const optionLabel = getOptionLabel(option);
            const isCorrectOption = optionLabel === currentQuestion.correctAnswer;
            const isSelectedOption = optionLabel === selectedOption;
            return (
              <Button
                key={index}
                variant={
                  isAnswered
                    ? isCorrectOption
                      ? "default"
                      : isSelectedOption
                        ? "destructive"
                        : "outline"
                    : "outline"
                }
                className="w-full justify-start text-left h-fit"
                onClick={() => handleOptionSelect(optionLabel)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <p className="text-wrap md:truncate">{optionLabel}</p>
                      {isAnswered && direction === "en_to_vi" && (
                        <p className="display lg:hidden font-bold">{`-${option.word}-`}</p>
                      )}
                      {isAnswered && direction === "vi_to_en" && (
                        <p className="display lg:hidden text-muted-foreground text-xs">
                          {`(${option.type}) ${option.meaning}`}
                        </p>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {direction === "en_to_vi"
                      ? isAnswered
                        ? option.word
                        : optionLabel
                      : isAnswered
                        ? `(${option.type}) ${option.meaning}`
                        : optionLabel}
                  </TooltipContent>
                </Tooltip>
              </Button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCloseQuiz}>
          Thoát
        </Button>
        <Button onClick={handleNextQuestion} disabled={!isAnswered}>
          {currentQuestionIndex < questions.length - 1
            ? "Câu tiếp theo"
            : "Xem kết quả"}
        </Button>
      </CardFooter>
    </Card>
  );
}
