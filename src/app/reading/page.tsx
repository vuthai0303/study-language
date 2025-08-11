"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TopicSelector } from "@/components/reading/topic-selector";
import { ReadingPractice } from "@/components/reading/reading-practice";
import { getHistoryParagraph, saveHistoryParagraph } from "@/lib/localStorage";
import { ReadingPracticeType } from "@/types";
import { DEFAULT_READING_TOPIC } from "@/consts";

const API_KEY_STORAGE_KEY = "openai_api_key";

export default function ReadingPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>("1");
  const [level, setLevel] = useState<string>("Trung cấp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPractice, setGeneratedPractice] =
    useState<ReadingPracticeType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [historyParagraph, setHistoryParagraph] = useState<string[]>([]);

  useEffect(() => {
    setHistoryParagraph(getHistoryParagraph(false));
  }, []);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);
  };

  const handleGeneratePractice = async () => {
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!apiKey) {
      setErrorMessage("Vui lòng cài đặt OpenAI API key trong mục Cài đặt.");
      return;
    }

    if (!selectedTopicId) {
      setErrorMessage("Vui lòng chọn một chủ đề.");
      return;
    }

    setIsGenerating(true);

    try {
      const topics = DEFAULT_READING_TOPIC;
      const selectedTopic = topics.find((t) => t.id === selectedTopicId);

      if (!selectedTopic) {
        setErrorMessage("Chủ đề không hợp lệ.");
        throw new Error("Topic not found");
      }

      // Xác định hướng dẫn theo trình độ
      let levelInstruction = "";
      if (level === "Cơ bản") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng dễ nhớ, phổ thông và cấu trúc câu cơ bản, phù hợp cho người có trình độ tiếng anh căn bản. Tương ứng với trình độ Toeic dưới 400, Ielts dưới 4.";
      } else if (level === "Trung cấp") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng phổ biến và cấu trúc câu ở mức trung cấp, phù hợp cho người có trình độ tiếng anh trung cấp. Tương ứng với trình độ Toeic từ 400 đến 700, Ielts từ 4 đến 7.";
      } else if (level === "Chuyên nghiệp") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng chuyên nghiệp, chính xác với tình huống và cấu trúc câu nâng cao, thể hiện sự tự nhiên và chuyên nghiệp, phù hợp cho người học trình độ tiếng anh chuyên nghiệp. Tương ứng với trình độ Toeic trên 700, Ielts trên 7.";
      } else {
        levelInstruction = "";
      }

      let topic = "";
      if (selectedTopic.name == "Sách / Tiểu thuyết") {
        topic = `Nội dung sẽ là 1 đoạn trích (khoảng 600 từ) hay, tâm đắc, phổ biến bằng tiếng anh trong các cuốn sách / tiểu thuyết sau: 
        Không Gia Đình - Hector Malot, Ông Già Và Biển Cả - Ernest Hemingway, Âm Thanh Và Cuồng Nộ - William Faulkner, Thép Đã Tôi Thế Đấy - Nikolai Ostrovsky,
        Nhà Giả Kim - Paulo Coelho, Lược Sử Thời Gian - Stephen Hawking, Cuốn Theo Chiều Gió - Margaret Munnerlyn Mitchell, Những Người Khốn Khổ - Victor Hugo,
        Hai Số Phận - Jeffrey Archer, Đồi Gió Hú - Ellis Bell, Chiến Tranh Và Hòa Bình - Lev Nikolayevich Tolstoy, Sông Đông êm đềm - Mikhail Aleksandrovich Sholokhov,
        Trăm Năm Cô Đơn - Gabriel Garcia Marquez, Từ Thăm Thẳm Lãng Quên - Patrick Modiano, Nếu Em Không Phải Một Giấc Mơ - Marc Levy.
        Hãy nhớ có thêm 1 dòng bằng tiếng anh mô tả đoạn văn trên được trích từ sách / tiểu thuyết nào?, trang bao nhiêu? vào cuối câu.
        Và khoảng 5 câu hỏi trắc nghiệm để người dùng dựa vào thông tin đã đọc từ đoạn trích để trả lời.`;
      } else {
        topic = `Nội dung sẽ gồm 1 đoạn văn khoảng 600 từ về chủ đề '${selectedTopic.name} và khoảng 5 câu hỏi trắc nghiệm để người dùng dựa vào thông tin đã đọc từ đoạn văn để trả lời.'`;
      }

      const prompt = `Hãy giúp tôi tạo ra 1 bài luyện tập khả năng đọc trong tiếng anh (tham khảo các bài thi về reading trong kì thi Toeic, Ielts,...). 
                      '${topic}'
                      \n ${levelInstruction}
                      \n
                      Kết quả sẽ trả về sẽ có kiểu json tương ứng như sau:
                      {
                        paragraph: "abc" // Đây là đoạn văn,
                        questions: [{
                            label: "Câu hỏi" // Đây là câu hỏi
                            answers: ["A. xyz", "B. abc", "C. xzt", "D. aqq"] // Danh sách kết quả trắc nghiệm, gồm 4 đáp án A, B, C, D
                            trueAnsswer: 1 // index tương ứng với kết quả đúng
                            explain: "Giải thích" // Giải thích ngắn gọn, dễ hiểu cho người dùng hiểu về kết quả đúng. Giải thích bằng tiếng việt.
                        }] // Danh sách gồm 5 câu hỏi tương ứng với đoạn văn
                      }
                      `;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-5-2025-08-07",
            messages: [
              {
                role: "system",
                content:
                  "Bạn là một trợ lý AI hữu ích, chuyên tạo ra các bài luyện tập khả năng đọc tiếng anh theo nhiều chủ đề và trình độ.",
              },
              {
                role: "system",
                content: `Sau đây là các các bài luyện tập khả năng đọc tiếng anh mà trước đó bạn đã giúp tôi tạo ra. 
                          \n Hãy đảm bảo rằng các bài luyện tập khả năng đọc tiếng anh mới được tạo ra sẽ khác 70% so với các đoạn văn trước đó.
                          \n ${historyParagraph.join("\n")}`,
              },
              {
                role: "user",
                content: prompt,
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
        const userFriendlyError =
          errorData?.error?.message ||
          `Lỗi ${response.status}. Vui lòng kiểm tra API key hoặc thử lại sau.`;
        setErrorMessage(`Lỗi tạo đoạn văn: ${userFriendlyError}`);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const message = data.choices[0]?.message?.content?.trim();

      const practice = message
        ? JSON.parse(message)
        : {
            paragraph: "",
            questions: [],
          };

      setHistoryParagraph(
        saveHistoryParagraph(
          false,
          [practice?.paragraph ?? "", ...historyParagraph].splice(0, 10)
        )
      );

      if (practice) {
        setGeneratedPractice(practice);
        setShowPractice(true);
      } else {
        setErrorMessage(
          "Không nhận được nội dung hợp lệ từ OpenAI. Vui lòng thử lại."
        );
        throw new Error("Empty response from OpenAI");
      }
    } catch (error) {
      console.error("Error generating paragraph:", error);
      if (!errorMessage) {
        setErrorMessage("Có lỗi xảy ra khi tạo bài tập. Vui lòng thử lại!");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPractice = () => {
    cancelPractice();
    handleGeneratePractice();
  };

  const cancelPractice = () => {
    setGeneratedPractice(null);
    setErrorMessage(null);
    setShowPractice(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Luyện đọc Tiếng Anh</h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Chọn một chủ đề và trình độ, sau đó nhấn &ldquo;Tạo bài tập&rdquo;
              để AI tạo bài tập.
            </p>
            <TopicSelector
              onTopicSelect={handleTopicSelect}
              onGeneratePractice={handleGeneratePractice}
              isGenerating={isGenerating}
              selectedTopicId={selectedTopicId}
              level={level}
              onLevelChange={setLevel}
            />
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2">Đang tạo bài tập...</p>
            </div>
          )}

          {errorMessage && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              <span className="font-medium">Lỗi:</span> {errorMessage}
            </div>
          )}

          {showPractice && generatedPractice && (
            <ReadingPractice
              practice={generatedPractice}
              resetPractice={resetPractice}
              cancelPractice={cancelPractice}
            />
          )}

          {!isGenerating &&
            !generatedPractice &&
            !errorMessage &&
            !selectedTopicId && (
              <p className="text-muted-foreground text-center py-4">
                Vui lòng chọn chủ đề và cài đặt API Key (nếu chưa có) để bắt
                đầu.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
