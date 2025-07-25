"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import axios from "axios"; // Uncomment when implementing actual OpenAI API calls

const API_KEY_STORAGE_KEY = "openai_api_key";

interface TranslationPracticeProps {
  paragraph: string;
  onReset: () => void;
}

type Feedback = {
  message: string;
  vocabs: { word: string; type: string; meaning: string }[];
  scope: number;
};

type Sentence = {
  id: number;
  text: string;
  translation: string;
  feedback: Feedback | null;
  isCorrect: boolean | null;
};

interface SentenceLayoutProps {
  sentence: Sentence;
  isCurrent: boolean;
  isLastSentence?: boolean;
}

const SentenceLayout = ({
  sentence,
  isCurrent,
  isLastSentence,
}: SentenceLayoutProps) => {
  if (sentence.isCorrect) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="border-l-2 border-green-500 rounded-sm py-0.5 bg-green-200/50">
              <span className="font-semibold text-green-500 pl-1">
                {sentence.translation}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span>{sentence.text}</span>
          </TooltipContent>
        </Tooltip>
        <span>{!isLastSentence ? " " : ""}</span>
      </>
    );
  }

  if (isCurrent) {
    return (
      <>
        <span className="border-l-2 border-amber-500 rounded-sm py-0.5 bg-amber-300/30">
          <span className="font-semibold text-amber-500 pl-1">
            {sentence.text}
          </span>
        </span>
        <span>{!isLastSentence ? " " : ""}</span>
      </>
    );
  }

  return (
    <span className="py-1">
      {sentence.text}
      {!isLastSentence ? " " : ""}
    </span>
  );
};

export function TranslationPractice({
  paragraph,
  onReset,
}: TranslationPracticeProps) {
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
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleTranslationChange = (translation: string) => {
    setSentences((prev) =>
      prev.map((sentence, index) =>
        index === currentSentenceIndex
          ? {
              ...sentence,
              translation,
              feedback: sentence.feedback,
              isCorrect: null,
            }
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
      const prompt = `Đây là bản dịch tiếng anh của tôi: "${currentSentence.translation}". Tương ứng với câu tiếng Việt: "${currentSentence.text}".`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4.1-2025-04-14",
            messages: [
              {
                role: "system",
                content: `Bạn là một trợ lý AI hữu ích, chuyên kiểm tra bản dịch tiếng Anh và thực hiện đánh giá và hướng dẫn cải thiện bản dịch cho tốt hơn.
                        Hãy đảm bảo đánh giá bản dịch đúng ngữ nghĩa, ngữ cảnh của đoạn văn, ngữ pháp và từ vựng phải chính xác và phù hợp với ngữ cảnh.
                        Thực hiện đánh giá trên 10 cấp độ.`,
              },
              {
                role: "user",
                content: `Đây là đoạn văn gốc bằng tiếng việt: "${paragraph}".
                      \nSau đây tôi sẽ thực hiện dịch từng câu của đoạn văn trên sang tiếng anh.
                      \nHãy giúp tôi kiểm tra bản dịch, thực hiện đánh giá trên 10 cấp độ và nêu phản hồi về cách cải thiện bản dịch tốt hơn.
                      \nĐảm bảo trả lời dưới dạng JSON với các trường "isCorrect" (boolean), "feedback" (string), "vocabs"(list) và scope(number). 
                      \nĐảm bảo phản hồi đúng cấu trúc và feedback nên ngắn gọn, rõ ràng và tập trung vào chỗ bị sai hoặc cần cải thiện thêm, feedback bằng tiếng việt.
                      \nNếu bản dịch có cấp độ từ 5 đến 10, câu dịch sẽ là isCorrect=true, hãy cung cấp phản hồi về cách cải thiện câu tốt hơn vào feebback.
                      \nNếu bản dịch có cấp độ từ 0 đến 5, câu dịch sẽ là isCorrect=false, hãy nêu rõ lý do tại sao bản dịch chưa đúng vào feedback và cung cấp các từ vựng tiếng anh liên quan đến câu dịch để giúp người tiếp tục cải thiện bản dịch vào vocabs.
                      \nVí dụ bản dịch đúng: {"isCorrect": true, "feedback": "Câu dịch rất tốt, tuy nhiên cần sửa lai từ "abc" thành "xyz" để làm cho nó tự nhiên hơn.", "vocabs": [], "scope":8}.
                      \nVí dụ bản dịch sai: {"isCorrect": false, "feedback": "Bản dịch chưa đúng, chỗ "abc" cần được sửa thành "xyz" vì nên sử dụng thì hiện tại đơn,... Tham khảo thêm các từ vựng sau để hoàn thành bản dịch.", "vocabs": [{word: study, type: "verb", meaning: "học"}, {word: vocabulary, type: "noun", meaning: "từ vựng"}, {word: practice, type: "verb", meaning: "luyện tập"}], "scope":3}.
                      \n
                      \n${prompt}
                      `,
              },
            ],
            // max_tokens: 250, // Adjusted for paragraph length
            // temperature: 0.7, // Balances creativity and coherence
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim();

      const res = result
        ? JSON.parse(result)
        : {
            isCorrect: false,
            feedback: "No feedback provided",
            vocabs: [],
            scope: 0,
          };

      const isCorrect = res.isCorrect;
      const feedback: Feedback = {
        message: res.feedback,
        vocabs: res.vocabs.map(
          (vocab: { word: string; type: string; meaning: string }) => ({
            word: vocab.word,
            type: vocab.type,
            meaning: vocab.meaning,
          })
        ),
        scope: res.scope,
      };

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

  const suggestTranslate = async () => {
    const currentSentence = sentences[currentSentenceIndex];
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!apiKey) {
      return;
    }

    setIsSuggesting(true);

    try {
      const prompt = `Đây là câu tiếng Anh mà tôi đang cần dịch sang tiếng việt: "${currentSentence.text}".`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                content:
                  "Bạn là một trợ lý AI hữu ích, chuyên đưa ra các gợi ý và từ vựng hỗ trợ giúp cho người dùng cải thiện khả năng dịch thuật. Hãy đảm bảo dịch sát ngữ nghĩa và đúng cấu trúc, ngữ pháp, ngữ cảnh.",
              },
              {
                role: "user",
                content: `Đây là đoạn văn gốc bằng tiếng việt: "${paragraph}".
                      \nSau đây tôi sẽ thực hiện dịch từng câu của đoạn văn trên sang tiếng anh.
                      \nHãy giúp tôi đưa ra các gợi ý và từ vựng hỗ trợ giúp tôi có thể hoàn thiện bản dịch.
                      \nĐảm bảo trả lời dưới dạng JSON với các trường"feedback" (string), "vocabs"(list). 
                      \nNội dung feedback nên ngắn gọn và rõ ràng bằng tiếng việt, tập trung gợi ý các ngữ pháp có thể sử dụng, có thêm mô tả ngắn gọn nên sử dụng ngữ pháp nào và tại sao. Bên cạnh đó cần chỉ rõ các thì nên sử dụng trong ngữ cảnh.
                      \nNội dung vocabs nên là danh sách các từ vựng tiếng anh liên quan đến câu dịch, đảm bảo đúng ngữ nghĩa và ngữ cảnh.
                      \nVí dụ: {"feedback": "Nên sử dụng thì quá khứ đơn vì ngữ cảnh đang ở quá khứ,...", "vocabs": [{word: study, type: "verb", meaning: "học"}, {word: vocabulary, type: "noun", meaning: "từ vựng"}, {word: practice, type: "verb", meaning: "luyện tập"}]}
                      \n
                      \n${prompt}
                      `,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim();

      const res = result
        ? JSON.parse(result)
        : { feedback: "No feedback provided", vocabs: [] };

      const feedback: Feedback = {
        message: res.feedback,
        vocabs: res.vocabs.map(
          (vocab: { word: string; type: string; meaning: string }) => ({
            word: vocab.word,
            type: vocab.type,
            meaning: vocab.meaning,
          })
        ),
        scope: 0,
      };

      // Update the sentence with feedback
      setSentences((prev) =>
        prev.map((sentence, index) =>
          index === currentSentenceIndex ? { ...sentence, feedback } : sentence
        )
      );
    } catch (error) {
      console.error("Error suggest translation:", error);
      alert("Có lỗi xảy ra khi gợi ý bản dịch. Vui lòng thử lại!");
    } finally {
      setIsSuggesting(false);
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
  const progress = Math.round(
    ((currentSentenceIndex + (isCompleted ? 1 : 0)) / sentences.length) * 100
  );

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
                  <p className="mt-2">
                    Bản dịch của bạn: {sentence.translation}
                  </p>
                  <p
                    className={`mt-2 ${
                      sentence.isCorrect ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {sentence.feedback?.message ?? "Không có phản hồi"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onReset} className="w-full">
            Bắt đầu lại
          </Button>
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

      <div className="flex flex-row gap-3">
        <Card className="w-3/4">
          <CardHeader>
            <CardTitle>
              Câu {currentSentenceIndex + 1}/{sentences.length}
            </CardTitle>
            <CardDescription>Dịch câu sau sang tiếng Anh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-base/7">
                {sentences.map((sentence, idx) => (
                  <SentenceLayout
                    key={sentence.id}
                    sentence={sentence}
                    isCurrent={idx === currentSentenceIndex}
                    isLastSentence={idx === sentences.length - 1}
                  />
                ))}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bản dịch của bạn:
              </label>
              <Textarea
                value={currentSentence.translation}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleTranslationChange(e.target.value)
                }
                placeholder="Nhập bản dịch của bạn..."
                disabled={currentSentence.isCorrect || isChecking}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onReset}>
              Hủy
            </Button>

            {currentSentence.isCorrect === true ? (
              <Button onClick={handleNextSentence}>
                {currentSentenceIndex < sentences.length - 1
                  ? "Câu tiếp theo"
                  : "Hoàn thành"}
              </Button>
            ) : (
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={suggestTranslate}
                  disabled={isSuggesting || isChecking}
                >
                  {isSuggesting ? "Đang đưa ra gợi ý..." : "Gợi ý"}
                </Button>
                <Button
                  onClick={checkTranslation}
                  disabled={isSuggesting || isChecking}
                >
                  {isChecking ? "Đang kiểm tra..." : "Kiểm tra"}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle>
              <div className="flex flex-row justify-between">
                <span>Nhận xét của AI</span>
                <span>{(currentSentence.feedback?.scope ?? "0") + "/10"}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSentence.feedback && (
              <div
                className={`p-4 rounded-md ${
                  currentSentence.isCorrect
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {currentSentence.feedback.message ?? "Không có phản hồi"}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentSentence.feedback && (
              <div className={`p-4 rounded-md`}>
                {currentSentence.feedback.vocabs.map((vocab, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-semibold">{vocab.word}</span>
                    <span>{" (" + vocab.type + ") : "}</span>
                    <span>{vocab.meaning}</span>
                  </div>
                ))}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
