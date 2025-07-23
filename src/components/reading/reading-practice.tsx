"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReadingPracticeType } from "@/types";

interface TranslationPracticeProps {
  practice: ReadingPracticeType;
  resetPractice: () => void;
  cancelPractice: () => void;
}

export function ReadingPractice({
  practice,
  resetPractice,
  cancelPractice,
}: TranslationPracticeProps) {
  const [isCompleted, setIsCompleted] = useState(false);
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

  const checkResult = async () => {
    if (isCompleted) {
      resetPractice();
      setSelectedAnswers(practice?.questions?.map(() => -1));
      setResults([]);
      setSummary({ correct: 0, incorrect: 0 });
      setIsCompleted(false);
      return;
    }
    // Kiểm tra đáp án
    const res = practice.questions.map(
      (q, idx) => selectedAnswers[idx] === q.trueAnsswer
    );
    setResults(res);
    const correct = res.filter(Boolean).length;
    setSummary({ correct, incorrect: res.length - correct });
    setIsCompleted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Đoạn văn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-base/7">{practice?.paragraph}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between"></CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Câu hỏi</CardTitle>
            <CardDescription>
              Dựa vào đoạn văn để trả lời các câu hỏi sau:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2 justify-end">
              <Button onClick={cancelPractice} disabled={false}>
                {"Hủy"}
              </Button>
              <Button onClick={checkResult}>
                {isCompleted ? "Tiếp tục học" : "Kiểm tra"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      {isCompleted && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md text-base font-semibold flex flex-col items-center">
          <div>
            Kết quả:{" "}
            <span className="text-green-600">{summary.correct} đúng</span> /{" "}
            <span className="text-red-600">{summary.incorrect} sai</span>
          </div>
        </div>
      )}
    </div>
  );
}
