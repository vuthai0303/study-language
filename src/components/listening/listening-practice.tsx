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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ListeningLevel,
  ListeningPracticeType,
  ListeningQuestion,
  ListeningSegment,
} from "@/types/listening";
import { CheckCircle2, Volume2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ListeningPracticeProps {
  practice: ListeningPracticeType;
  level: ListeningLevel;
  onReset: () => void;
}

export function ListeningPractice({
  practice,
  level,
  onReset,
}: ListeningPracticeProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(() =>
    practice.questions.map(() => -1)
  );
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [summary, setSummary] = useState({ correct: 0, incorrect: 0 });

  const { speak, isSupported } = useTextToSpeech({ lang: "en-US", rate: 0.98 });

  useEffect(() => {
    setSelectedAnswers(practice.questions.map(() => -1));
    setSubmitted(false);
    setResults([]);
    setSummary({ correct: 0, incorrect: 0 });
  }, [practice]);

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    if (submitted) return;

    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = answerIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    if (submitted || selectedAnswers.includes(-1)) return;

    const nextResults = practice.questions.map(
      (question, index) => selectedAnswers[index] === question.answerIndex
    );

    const correct = nextResults.filter(Boolean).length;
    setResults(nextResults);
    setSummary({
      correct,
      incorrect: nextResults.length - correct,
    });
    setSubmitted(true);
  };

  const renderOption = (
    question: ListeningQuestion,
    questionIndex: number,
    option: string,
    optionIndex: number
  ) => {
    const isSelected = selectedAnswers[questionIndex] === optionIndex;
    const isCorrectAnswer = question.answerIndex === optionIndex;

    return (
      <Button
        key={optionIndex}
        type="button"
        variant="outline"
        disabled={submitted}
        onClick={() => handleSelectAnswer(questionIndex, optionIndex)}
        className={cn(
          "h-auto w-full justify-start whitespace-normal px-4 py-3 text-left leading-6",
          !submitted && isSelected && "border-primary bg-primary/10 text-primary",
          submitted && isCorrectAnswer && "border-green-500 bg-green-50 text-green-700",
          submitted && isSelected && !isCorrectAnswer && "border-red-500 bg-red-50 text-red-700"
        )}
      >
        {option}
      </Button>
    );
  };

  const renderProfessionalSegments = () => {
    if (level !== "Chuyên nghiệp") return null;

    const segments: ListeningSegment[] = practice.segments ?? [];
    if (segments.length === 0) return null;

    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Bài nghe theo phần</CardTitle>
          <CardDescription>
            Nhấn nút phát để nghe từng phần riêng. Transcript sẽ hiện sau khi nộp bài.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            {segments.map((segment) => (
              <div key={segment.id} className="rounded-xl border bg-background p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{segment.title}</p>
                  <p className="text-xs text-muted-foreground">{segment.subtitle}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => speak(segment.audioText)}
                  disabled={!isSupported || !segment.audioText.trim()}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Phát phần này
                </Button>
                {!isSupported && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Thiết bị này không hỗ trợ phát âm thanh.
                  </p>
                )}
                {submitted && (
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {segment.transcript}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuestionCard = (
    question: ListeningQuestion,
    questionIndex: number
  ) => {
    const isCorrect = results[questionIndex];
    const hasSegmentInfo = level === "Chuyên nghiệp" && question.segmentId;

    return (
      <Card key={question.id} className="border-border/70">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-base md:text-lg">
              Câu {questionIndex + 1}
            </CardTitle>
            {hasSegmentInfo && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Phần {question.segmentId}
              </span>
            )}
          </div>
          <CardDescription className="text-sm leading-6">
            {question.prompt}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {level !== "Chuyên nghiệp" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => speak(question.audioText)}
                disabled={!isSupported || !question.audioText.trim()}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Nghe câu hỏi
              </Button>
              {!isSupported && (
                <p className="text-sm text-muted-foreground">
                  Thiết bị này không hỗ trợ phát âm thanh.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option, optionIndex) =>
              renderOption(question, questionIndex, option, optionIndex)
            )}
          </div>

          {submitted && (
            <div
              className={cn(
                "rounded-xl border p-4 text-sm leading-7",
                isCorrect
                  ? "border-green-500/30 bg-green-50 text-green-800"
                  : "border-red-500/30 bg-red-50 text-red-800"
              )}
            >
              <div className="flex items-center gap-2 font-semibold">
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {isCorrect ? "Đúng" : "Sai"}
              </div>
              <p className="mt-2">{question.explanation}</p>

              {level !== "Chuyên nghiệp" && question.transcript && (
                <div className="mt-3 rounded-lg bg-background/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Transcript
                  </p>
                  <p className="mt-2 leading-7">{question.transcript}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProfessionalTranscript = () => {
    if (level !== "Chuyên nghiệp" || !submitted) return null;

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Đoạn văn đầy đủ</CardTitle>
          <CardDescription>
            Transcript của bài nghe sẽ chỉ hiện sau khi nộp bài.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Toàn bộ bài nghe
            </p>
            <ScrollArea className="mt-2 max-h-72 pr-3">
              <p className="whitespace-pre-line leading-7">
                {practice.fullTranscript || (practice.segments ?? []).map((segment) => segment.transcript).join(" ")}
              </p>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {submitted && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Kết quả</CardTitle>
            <CardDescription>
              {summary.correct}/{practice.questions.length} câu đúng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-background p-4">
                <p className="text-sm text-muted-foreground">Đúng</p>
                <p className="text-3xl font-bold text-green-600">{summary.correct}</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <p className="text-sm text-muted-foreground">Sai</p>
                <p className="text-3xl font-bold text-red-600">{summary.incorrect}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {renderProfessionalSegments()}
      {renderProfessionalTranscript()}

      <div className="grid gap-4">
        {practice.questions.map((question, questionIndex) =>
          renderQuestionCard(question, questionIndex)
        )}
      </div>

      <Card className="border-dashed">
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Button type="button" variant="outline" onClick={onReset}>
            Làm bài mới
          </Button>
          {!submitted ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={selectedAnswers.includes(-1)}
            >
              Nộp bài
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Đã nộp bài. Bạn có thể làm lại để luyện tiếp.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
