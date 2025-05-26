"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import axios from "axios"; // Uncomment when implementing actual OpenAI API calls

const API_KEY_STORAGE_KEY = "openai_api_key";

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
          ? { ...sentence, translation, feedback: sentence.feedback, isCorrect: null }
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

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!apiKey) {
      return;
    }
    
    try {

      const prompt = `Kiểm tra bản dịch tiếng Anh "${currentSentence.translation}" sau có đúng với câu tiếng Việt: "${currentSentence.text}" không.
                      Hãy cho biết bản dịch có chính xác không, nếu bản dịch đã chính xác hãy cung cấp phản hồi về cách cải thiện câu tốt hơn. 
                      Nếu bản dịch chưa chính xác, chỉ cần cung cấp các từ vựng tiếng anh liên quan đến câu để giúp người tiếp tục cải thiện bản dịch, không cần phản hồi gì thêm.
                      Trả lời dưới dạng JSON với các trường "isCorrect" (boolean) và "feedback" (string). Phản hồi nên ngắn gọn và rõ ràng bằng tiếng việt. Ví dụ: {"isCorrect": true, "feedback": "Câu dịch rất tốt, chỉ cần thêm một vài từ để làm cho nó tự nhiên hơn."}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano-2025-04-14",
          // model: "gpt-4.1-2025-04-14",
          messages: [
            {
              role: "system",
              content: "Bạn là một trợ lý AI hữu ích, chuyên kiểm tra bản dịch tiếng Anh.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          // max_tokens: 250, // Adjusted for paragraph length
          // temperature: 0.7, // Balances creativity and coherence
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        // const userFriendlyError = errorData?.error?.message || `Lỗi ${response.status}. Vui lòng kiểm tra API key hoặc thử lại sau.`;
        // setErrorMessage(`Lỗi tạo đoạn văn: ${userFriendlyError}`);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim();

      const res = result ? JSON.parse(result) : { isCorrect: false, feedback: "No feedback provided" };
      
      const isCorrect = res.isCorrect;
      const feedback = res.feedback;
      
      
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
            <p>
              {sentences.map((sentence, idx) => (
                <span
                  key={sentence.id}
                  className={idx === currentSentenceIndex ? "text-red-500 font-semibold" : sentence.isCorrect ? "text-green-500 font-semibold" : undefined}
                  style={idx === currentSentenceIndex ? { fontWeight: "bold" } : undefined}
                >
                  {sentence.isCorrect ? sentence.translation : sentence.text}
                  {idx < sentences.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bản dịch của bạn:</label>
            <Textarea
              value={currentSentence.translation}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTranslationChange(e.target.value)}
              placeholder="Nhập bản dịch của bạn..."
              disabled={currentSentence.isCorrect || isChecking}
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
          
          {currentSentence.isCorrect === true ? (
            <Button onClick={handleNextSentence}>
              {currentSentenceIndex < sentences.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}
            </Button>
          ) : (
            <>
              <Button onClick={checkTranslation} disabled={isChecking}>
                {isChecking ? "Đang kiểm tra..." : "Kiểm tra"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}