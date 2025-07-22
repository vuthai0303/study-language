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

  const checkResult = async () => {
    if (isCompleted) resetPractice();
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
                <div key={idx} className="flex flex-col">
                  <div className="font-bold">{`Câu hỏi ${idx + 1}: ${
                    question.label
                  }`}</div>
                  <div className="flex flex-row flex-wrap">
                    {question?.answers?.map((answer, i) => {
                      return (
                        <div key={i} className="w-1/2 p-2">
                          {answer}
                        </div>
                      );
                    })}
                  </div>
                  {isCompleted && <div className="">{question.explain}</div>}
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
    </div>
  );
}
