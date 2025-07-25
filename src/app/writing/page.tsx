"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TopicSelector } from "@/components/writing/topic-selector";
import { TranslationPractice } from "@/components/writing/translation-practice";
import { getTopics } from "@/lib/localStorage";
import { Button } from "@/components/ui/button"; // Added for potential use, can be removed if not needed
import { Textarea } from "@/components/ui/textarea"; // Added for displaying generated paragraph

const API_KEY_STORAGE_KEY = "openai_api_key";

export default function WritingPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [level, setLevel] = useState<string>("Trung cấp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedParagraph, setGeneratedParagraph] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTranslationPractice, setShowTranslationPractice] = useState(false);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setErrorMessage(null); // Clear error when topic changes
    setGeneratedParagraph(null); // Clear previous paragraph
    setShowTranslationPractice(false);
  };

  const handleGenerateParagraph = async () => {
    setErrorMessage(null);
    setGeneratedParagraph(null);
    setShowTranslationPractice(false);

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
      const topics = getTopics();
      const selectedTopic = topics.find((t) => t.id === selectedTopicId);

      if (!selectedTopic) {
        setErrorMessage("Chủ đề không hợp lệ.");
        throw new Error("Topic not found");
      }

      // Xác định hướng dẫn theo trình độ
      let levelInstruction = "";
      if (level === "Cơ bản") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng và cấu trúc câu cơ bản, phù hợp cho người mới học thực hành dịch thuật từ tiếng việt sang tiếng anh.";
      } else if (level === "Trung cấp") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng và cấu trúc câu ở mức trung cấp, phù hợp cho người có trình độ trung cấp để thực hành dịch thuật từ tiếng việt sang tiếng anh.";
      } else if (level === "Chuyên nghiệp") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng và cấu trúc câu nâng cao, thể hiện sự tự nhiên và chuyên nghiệp, phù hợp cho người học trình độ cao để thực hành dịch thuật từ tiếng việt sang tiếng anh.";
      } else {
        levelInstruction = "";
      }
      const prompt = `Viết một đoạn văn chi tiết bằng tiếng Việt có độ dài khoảng 100-150 từ về chủ đề: '${selectedTopic.name}'. ${levelInstruction}`;

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
                content:
                  "Bạn là một trợ lý AI hữu ích, chuyên tạo ra các đoạn văn bằng tiếng Việt theo chủ đề cho mục đích học ngôn ngữ.",
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
      const paragraph = data.choices[0]?.message?.content?.trim();

      if (paragraph) {
        setGeneratedParagraph(paragraph);
        setShowTranslationPractice(true); // Show translation practice after successful generation
      } else {
        setErrorMessage(
          "Không nhận được nội dung hợp lệ từ OpenAI. Vui lòng thử lại."
        );
        throw new Error("Empty response from OpenAI");
      }
    } catch (error) {
      console.error("Error generating paragraph:", error);
      if (!errorMessage) {
        // Avoid overwriting specific API error messages
        setErrorMessage("Có lỗi xảy ra khi tạo đoạn văn. Vui lòng thử lại!");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedParagraph(null);
    setSelectedTopicId(null); // Optionally reset topic as well
    setLevel("Trung cấp");
    setErrorMessage(null);
    setShowTranslationPractice(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Học viết Tiếng Anh</h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Chọn một chủ đề, sau đó nhấn &ldquo;Tạo đoạn văn&rdquo; để AI tạo
              nội dung. Bạn có thể sử dụng đoạn văn này để thực hành dịch.
            </p>
            <TopicSelector
              onTopicSelect={handleTopicSelect}
              onGenerateParagraph={handleGenerateParagraph}
              isGenerating={isGenerating}
              selectedTopicId={selectedTopicId}
              level={level}
              onLevelChange={setLevel}
            />
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2">Đang tạo đoạn văn...</p>
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

          {generatedParagraph && !showTranslationPractice && (
            // This state might be redundant if TranslationPractice is shown immediately
            <div>
              <h2 className="text-xl font-semibold mb-2">Đoạn văn đã tạo:</h2>
              <Textarea
                value={generatedParagraph}
                readOnly
                rows={8}
                className="mb-4"
              />
              <Button onClick={() => setShowTranslationPractice(true)}>
                Bắt đầu thực hành dịch
              </Button>
            </div>
          )}

          {showTranslationPractice && generatedParagraph && (
            <TranslationPractice
              paragraph={generatedParagraph}
              onReset={handleReset}
            />
          )}

          {!isGenerating &&
            !generatedParagraph &&
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
