"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import axios from "axios"; // Uncomment when implementing actual OpenAI API calls

interface TranslationPracticeProps {
  paragraph: string;
  onReset: () => void;
}

type Sentence = {
  id: number;
  text: string;
  translation: string;
  feedback: string | null;
  isCorrect: boolean | null;
};

export function TranslationPractice({ paragraph, onReset }: TranslationPracticeProps) {
  const [sentences, setSentences] = useState<Sentence[]>(() => {
    // Split paragraph into sentences
    return paragraph
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0)
      .map((text, index) => ({
        id: index,
        text,
        translation: "",
        feedback: null,
        isCorrect: null,
      }));
  });
  
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleTranslationChange = (translation: string) => {
    setSentences((prev) =>
      prev.map((sentence, index) =>
        index === currentSentenceIndex
          ? { ...sentence, translation, feedback: null, isCorrect: null }
          : sentence
      )
    );
  };

  const checkTranslation = async () => {
    const currentSentence = sentences[currentSentenceIndex];
    
    if (!currentSentence.translation.trim()) {
      alert("Vui lòng nhập bản dịch của bạn!");
      return;
    }
    
    setIsChecking(true);
    
    try {
      // In a real application, this would call the OpenAI API
      // For this demo, we'll simulate the API call
      
      // Simulated API response
      const isCorrect = Math.random() > 0.3; // 70% chance of being correct for demo
      const feedback = isCorrect
        ? "Bản dịch của bạn chính xác! Ý nghĩa và ngữ pháp đều tốt."
        : "Bản dịch cần cải thiện. Hãy chú ý đến thì của động từ và cấu trúc câu.";
      
      // In a real application, you would use OpenAI API like this:
      /*
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a language teacher evaluating English translations from Vietnamese."
            },
            {
              role: "user",
              content: `Original Vietnamese: "${currentSentence.text}"\nStudent's English translation: "${currentSentence.translation}"\n\nEvaluate if this translation is correct in terms of grammar and meaning. Respond with JSON in this format: {"isCorrect": boolean, "feedback": "your feedback here"}`
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
          }
        }
      );
      
      const result = JSON.parse(response.data.choices[0].message.content);
      const isCorrect = result.isCorrect;
      const feedback = result.feedback;
      */
      
      // Update the sentence with feedback
      setSentences((prev) =>
        prev.map((sentence, index) =>
          index === currentSentenceIndex
            ? { ...sentence, feedback, isCorrect }
            : sentence
        )
      );
    } catch (error) {
      console.error("Error checking translation:", error);
      alert("Có lỗi xảy ra khi kiểm tra bản dịch. Vui lòng thử lại!");
    } finally {
      setIsChecking(false);
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentSentence = sentences[currentSentenceIndex];
  const progress = Math.round(((currentSentenceIndex + (isCompleted ? 1 : 0)) / sentences.length) * 100);

  if (isCompleted) {
    const correctCount = sentences.filter((s) => s.isCorrect).length;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoàn thành!</CardTitle>
          <CardDescription>Bạn đã hoàn thành bài tập dịch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">
                {correctCount}/{sentences.length}
              </p>
              <p className="text-muted-foreground">Số câu dịch đúng</p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Tất cả các câu:</h3>
              {sentences.map((sentence) => (
                <div key={sentence.id} className="border p-4 rounded-md">
                  <p className="font-medium">{sentence.text}</p>
                  <p className="mt-2">Bản dịch của bạn: {sentence.translation}</p>
                  <p className={`mt-2 ${sentence.isCorrect ? "text-green-500" : "text-red-500"}`}>
                    {sentence.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onReset} className="w-full">Bắt đầu lại</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Câu {currentSentenceIndex + 1}/{sentences.length}</CardTitle>
          <CardDescription>Dịch câu sau sang tiếng Anh</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p>{currentSentence.text}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bản dịch của bạn:</label>
            <Textarea
              value={currentSentence.translation}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTranslationChange(e.target.value)}
              placeholder="Nhập bản dịch của bạn..."
              disabled={!!currentSentence.feedback || isChecking}
              className="min-h-[100px]"
            />
          </div>
          
          {currentSentence.feedback && (
            <div className={`p-4 rounded-md ${currentSentence.isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {currentSentence.feedback}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Hủy
          </Button>
          
          {currentSentence.isCorrect !== null ? (
            <Button onClick={handleNextSentence}>
              {currentSentenceIndex < sentences.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}
            </Button>
          ) : (
            <Button onClick={checkTranslation} disabled={isChecking}>
              {isChecking ? "Đang kiểm tra..." : "Kiểm tra"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}