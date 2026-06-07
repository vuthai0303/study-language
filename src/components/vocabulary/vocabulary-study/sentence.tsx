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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAI } from "@/hooks/useAI";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { QuizResult, SentenceQuestion, StudyDirection, VocabularyType } from "@/types/vocabulary";
import { Loader2, Speech } from "lucide-react";
import { useEffect, useState } from "react";

interface VocabularySentenceStudyProps {
  vocabulary: VocabularyType[];
  direction: StudyDirection;
  quizStarted: boolean;
  onRefresh: () => void;
  startQuiz: () => void;
  onCloseQuiz: () => void;
}

// Randomly reveal approximately 1/5 of characters in a sentence as hints
function getRandomRevealedIndexes(sentence: string): number[] {
  if (!sentence) return [];

  // Always reveal first char of each word and spaces
  const spaceIndexes: number[] = [];
  const firstCharIndexes: number[] = [0];
  for (let i = 0; i < sentence.length; i++) {
    if (sentence[i] === " ") {
      spaceIndexes.push(i);
      if (i + 1 < sentence.length) firstCharIndexes.push(i + 1);
    }
  }

  const alwaysRevealed = [...spaceIndexes, ...firstCharIndexes];
  const revealCount = Math.max(
    alwaysRevealed.length + 1,
    Math.ceil(sentence.length / 5) + alwaysRevealed.length
  );

  const indexes = [...alwaysRevealed];
  let attempts = 0;
  while (indexes.length < revealCount && attempts < 1000) {
    const idx = Math.floor(Math.random() * sentence.length);
    if (!indexes.includes(idx)) {
      indexes.push(idx);
    }
    attempts++;
  }
  return indexes;
}

export function VocabularySentenceStudy({
  vocabulary,
  direction,
  quizStarted,
  onRefresh,
  startQuiz,
  onCloseQuiz,
}: VocabularySentenceStudyProps) {
  const { callAI } = useAI();
  const { speak, isSupported } = useTextToSpeech();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SentenceQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isHiddenSentence, setIsHiddenSentence] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [correctIndexes, setCorrectIndexes] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [result, setResult] = useState<QuizResult>({
    total: 0,
    correct: 0,
    incorrect: 0,
  });

  // Generate questions via AI when quiz starts
  useEffect(() => {
    if (!quizStarted || vocabulary.length === 0) return;

    const generateQuestions = async () => {
      setIsLoading(true);
      setLoadError(null);
      setQuizFinished(false);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setUserAnswer("");
      setIsCorrect(null);

      const wordList = vocabulary
        .map((v) => `${v.word} (${v.type}): ${v.meaning}`)
        .join(", ");

      const prompt = `Cho danh sách từ vựng tiếng Anh sau: [${wordList}].
        Hãy tạo đúng 10 câu hỏi luyện tập và đảm bảo mỗi câu văn được tạo ra phải chứa ít nhất 2 từ trong danh sách trên.
        Mỗi câu hỏi:
        - Từ danh sách từ vựng trên, hãy tạo ra 1 câu văn hoàn chỉnh bằng tiếng Anh (đảm bảo câu văn tự nhiên, có ý nghĩa, thường được sử dụng trong giao tiếp hằng ngày)
        - Dịch câu tiếng Anh đó sang tiếng Việt
        - Tạo thêm 3 câu tiếng Việt sai (nội dung khác biệt không quá nhiều so với câu đúng để người nghe/đọc dễ bị bối rối tuy nhiên vẫn phải có thể phân biệt được) làm đáp án nhiễu
        Trả về JSON array (không có thêm ký tự nào khác), mỗi phần tử có dạng:
        {"englishSentence":"...","vietnameseSentence":"...","wrongOptions":["...","...","..."]}`;

      try {
        const response = await callAI(prompt);
        if (!response.isSuccess || !response.data?.text) {
          console.error('Error call AI: ', response)
          setLoadError("Có lỗi xảy ra khi gọi AI, vui lòng thử lại sau một ít phút.");
          setIsLoading(false);
          return;
        }

        const text = response.data.text;
        let jsonText = text;
        const startIdx = text.indexOf("[");
        const endIdx = text.lastIndexOf("]");
        if (startIdx !== -1 && endIdx !== -1) {
          jsonText = text.slice(startIdx, endIdx + 1);
        }

        const parsed: any[] = JSON.parse(jsonText) as any[];

        const generated: SentenceQuestion[] = parsed.map((item, idx) => {
          const wrongOptions: string[] = item.wrongOptions ?? [];
          let options: string[];
          let correctAnswer: string;

          if (direction === "en_to_vi") {
            correctAnswer = item.vietnameseSentence as string;
            options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());
          } else {
            // vi_to_en: user types the English sentence
            correctAnswer = item.englishSentence as string;
            options = [];
          }

          return {
            id: `sentence-${idx}`,
            englishSentence: item.englishSentence as string,
            vietnameseSentence: item.vietnameseSentence as string,
            options,
            correctAnswer,
          };
        });

        setQuestions(generated);
        setResult({ total: generated.length, correct: 0, incorrect: 0 });

        if (direction === "vi_to_en" && generated.length > 0) {
          setRevealedIndexes(getRandomRevealedIndexes(generated[0].englishSentence));
        }
      } catch (err) {
        console.error("Sentence study AI error:", err);
        setLoadError("Có lỗi xảy ra khi phân tích kết quả từ AI, vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, vocabulary]);

  // Reset state when question changes (vi_to_en mode)
  useEffect(() => {
    if (questions.length === 0 || quizFinished) return;
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswer("");
    setIsCorrect(null);
    setCorrectIndexes([]);
    if (direction === "vi_to_en") {
      const sentence = questions[currentQuestionIndex]?.englishSentence ?? "";
      setRevealedIndexes(getRandomRevealedIndexes(sentence));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    const correct = option === questions[currentQuestionIndex].correctAnswer;
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCorrect(correct);
    setResult((prev) => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));
  };

  const checkCorrectCharIndexes = (answer: string, target: string): number[] => {
    const result: number[] = [];
    answer.split("").forEach((ch, idx) => {
      if (ch.toLowerCase() === target[idx]?.toLowerCase()) result.push(idx);
    });
    return result;
  };

  const handleCheckAnswer = () => {
    if (isAnswered || !userAnswer.trim()) return;
    const target = questions[currentQuestionIndex].correctAnswer;
    const correct = userAnswer.trim().toLowerCase() === target.trim().toLowerCase();
    setIsAnswered(true);
    setIsCorrect(correct);
    setCorrectIndexes(checkCorrectCharIndexes(userAnswer, target));
    setResult((prev) => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));
    onRefresh();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">AI đang tạo câu hỏi luyện tập...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (loadError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Có lỗi xảy ra</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{loadError}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={startQuiz}>Thử lại</Button>
          <Button variant="outline" onClick={onCloseQuiz}>Thoát</Button>
        </CardFooter>
      </Card>
    );
  }

  // Results screen
  if (quizFinished) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Kết quả</CardTitle>
          <CardDescription>Bạn đã hoàn thành bài luyện tập câu văn!</CardDescription>
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
          <div className="w-full justify-center items-center flex flex-row flex-wrap gap-2">
            <Button onClick={startQuiz} className="w-fit">Học lại</Button>
            <Button onClick={onCloseQuiz} className="w-fit">Kết thúc</Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  // ─── English → Vietnamese (MCQ) ───────────────────────────────────────────
  if (direction === "en_to_vi") {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="flex flex-row justify-between">
            <div>Câu hỏi {currentQuestionIndex + 1}/{questions.length}</div>
            <div className="flex items-center gap-2 text-sm font-normal">
              <Switch
                id="hide-sentence-switch"
                defaultChecked={!isHiddenSentence}
                onCheckedChange={(checked) => setIsHiddenSentence(!checked)}
              />
              Hiện câu văn
            </div>
          </CardTitle>
          <CardDescription>Chọn bản dịch tiếng Việt đúng của câu tiếng Anh</CardDescription>
        </CardHeader>
        <CardContent>
          {/* English sentence display */}
          <div className="mb-6 flex flex-row flex-wrap gap-2 justify-center items-center">
            {(!isHiddenSentence || isAnswered) && (
              <p className="text-xl font-semibold text-center leading-relaxed">
                {currentQuestion.englishSentence}
              </p>
            )}
            {isHiddenSentence && !isAnswered && (
              <p className="text-muted-foreground italic text-center">
                (Câu văn đang ẩn — bật switch để hiện)
              </p>
            )}
            {isSupported && (
              <Button
                onClick={() => speak(currentQuestion.englishSentence)}
                variant="outline"
                size="icon"
                title="Nghe câu tiếng Anh"
              >
                <Speech />
              </Button>
            )}
          </div>

          {/* Options */}
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
                className="w-full justify-start text-left h-fit py-3"
                onClick={() => handleOptionSelect(option)}
              >
                <p className="text-wrap">{option}</p>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCloseQuiz}>Thoát</Button>
          <Button onClick={handleNextQuestion} disabled={!isAnswered}>
            {currentQuestionIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ─── Vietnamese → English (fill blank) ────────────────────────────────────
  const englishTarget = currentQuestion.englishSentence;

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Câu hỏi {currentQuestionIndex + 1}/{questions.length}</CardTitle>
        <CardDescription>
          Nhìn câu tiếng Việt và dịch sang tiếng Anh hoàn chỉnh
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Vietnamese sentence (always visible) */}
        <div className="mb-6 flex flex-row flex-wrap gap-2 justify-center items-center text-center">
          <p className="text-lg font-semibold text-primary">
            {currentQuestion.vietnameseSentence}
          </p>
          {isSupported && (
            <Button
              onClick={() => speak(englishTarget)}
              variant="outline"
              size="icon"
              title="Nghe câu tiếng Anh"
            >
              <Speech />
            </Button>
          )}
        </div>

        {/* Character hint boxes */}
        <div className="mb-6 flex flex-wrap justify-center gap-1">
          {englishTarget.split("").map((char, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              readOnly
              className={`
                ${char === " " ? "w-4 border-none bg-transparent" : "w-8 h-10 text-center text-sm border rounded"}
                ${isAnswered && char !== " "
                  ? correctIndexes.includes(idx)
                    ? "bg-green-200 text-black font-bold"
                    : "bg-red-200 text-black font-bold"
                  : revealedIndexes.includes(idx) && char !== " "
                    ? "bg-muted text-foreground font-bold"
                    : "bg-background"
                }
              `}
              value={revealedIndexes.includes(idx) || isAnswered ? char : ""}
              disabled={true}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <Input
            placeholder="Nhập câu tiếng Anh..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswered}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCheckAnswer();
            }}
          />
        </div>

        {/* Result */}
        {isAnswered && (
          <div className="text-center mb-2">
            {isCorrect ? (
              <span className="text-green-600 font-semibold">Chính xác!</span>
            ) : (
              <span className="text-red-600 font-semibold">
                Sai! Đáp án đúng:{" "}
                <span className="underline italic">{englishTarget}</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCloseQuiz}>Thoát</Button>
        {!isAnswered ? (
          <Button onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>
            Kiểm tra
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? "Tiếp theo" : "Xem kết quả"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
