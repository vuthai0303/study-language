"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReadingPracticeType } from "@/types";
import { ScrollArea } from "../ui/scroll-area";

interface TranslationPracticeProps {
  practice: ReadingPracticeType;
  isCompleted: boolean;
}

export function ReadingPractice({
  practice,
  isCompleted
}: TranslationPracticeProps) {
  // Lưu đáp án người dùng chọn cho từng câu hỏi
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(() =>
    practice?.questions?.map(() => -1)
  );
  // Lưu kết quả đúng/sai cho từng câu hỏi sau khi kiểm tra
  const [results, setResults] = useState<boolean[]>([]);
  // Tổng kết số câu đúng/sai
  const [summary, setSummary] = useState<{
    correct: number;
    incorrect: number;
  }>({ correct: 0, incorrect: 0 });

  const handleSelect = (qIdx: number, aIdx: number) => {
    if (isCompleted) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = aIdx;
      return next;
    });
  };

  const reset = () => {
    setSelectedAnswers(practice?.questions?.map(() => -1));
    setResults([]);
    setSummary({ correct: 0, incorrect: 0 });
  }

  // Kiểm tra đáp án
  useEffect(() => {
    if (!isCompleted) reset();
    const res = practice.questions.map(
      (q, idx) => selectedAnswers[idx] === q.trueAnsswer
    );
    setResults(res);
    const correct = res.filter(Boolean).length;
    setSummary({ correct, incorrect: res.length - correct });
  }, [isCompleted])

  return (
    <div className="h-fit">
      <div className="h-full flex flex-row gap-2 overflow-hidden">
        <Card className="w-full h-full min-h-[400px] gap-3 py-3 flex flex-col">
          <CardHeader>
            <CardTitle>Đoạn văn</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <ScrollArea className="h-[calc(100%-40px)]">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-base/7">{practice?.paragraph}</p>
            </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between"></CardFooter>
        </Card>

        <Card className="w-full h-full min-h-[400px] gap-3 py-3 flex flex-col">
          <CardHeader>
            <CardTitle>
              <div className="flex flex-row justify-between">
                <div>Câu hỏi</div>
                <div className="text-sm text-muted-foreground">
                  {isCompleted && (
                    <div>
                        <span className="text-green-600">{summary.correct} đúng</span> /{" "}
                        <span className="text-red-600">{summary.incorrect} sai</span>
                    </div>
                    )}
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              Dựa vào đoạn văn để trả lời các câu hỏi sau:
            </CardDescription>
            
          </CardHeader>
          <CardContent className="h-[calc(100%-96px)]">
            <ScrollArea className="h-full">
            {practice?.questions?.map((question, idx) => {
              return (
                <div key={idx} className="flex flex-col mb-4 border-b pb-2">
                  <div className="font-bold mb-2">{`Câu hỏi ${idx + 1}: ${
                    question.label
                  }`}</div>
                  <div className="flex flex-row flex-wrap">
                    {question?.answers?.map((answer, i) => (
                      <label
                        key={i}
                        className={`w-1/2 p-2 flex items-center gap-2 cursor-pointer ${
                          isCompleted
                            ? i === question.trueAnsswer
                              ? "font-bold text-green-600"
                              : selectedAnswers[idx] === i &&
                                i !== question.trueAnsswer
                              ? "text-red-600"
                              : ""
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={i}
                          checked={selectedAnswers[idx] === i}
                          disabled={isCompleted}
                          onChange={() => handleSelect(idx, i)}
                          className="mr-2"
                        />
                        {answer}
                        {isCompleted && i === question.trueAnsswer && (
                          <span className="ml-1 text-green-600 font-semibold">
                            (Đáp án đúng)
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  {isCompleted && (
                    <div className="mt-1">
                      <span
                        className={`font-semibold ${
                          results[idx] ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {question.explain}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
