"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const GRAMMAR_TOPICS = [
  "Hiện tại đơn (Present Simple)",
  "Hiện tại tiếp diễn (Present Continuous)",
  "Hiện tại hoàn thành (Present Perfect)",
  "Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)",
  "Quá khứ đơn (Past Simple)",
  "Quá khứ tiếp diễn (Past Continuous)",
  "Quá khứ hoàn thành (Past Perfect)",
  "Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)",
  "Tương lai đơn (Future Simple)",
  "Tương lai tiếp diễn (Future Continuous)",
  "Tương lai hoàn thành (Future Perfect)",
  "Tương lai hoàn thành tiếp diễn (Future Perfect Continuous)",
  "Câu bị động (Passive Voice)",
  "Câu điều kiện (Conditional Sentences)",
  "Câu tường thuật (Reported Speech)",
  "Động từ khuyết thiếu (Modal Verbs)",
  "Mạo từ (Articles)",
  "Giới từ (Prepositions)",
  "Mệnh đề quan hệ (Relative Clauses)",
  "Danh động từ và động từ nguyên mẫu (Gerunds and Infinitives)",
  "So sánh hơn và so sánh nhất (Comparatives and Superlatives)",
  "Câu hỏi đuôi (Question Tags)",
  "Tân ngữ trực tiếp và gián tiếp (Direct and Indirect Objects)",
  "Sự hòa hợp giữa chủ ngữ và động từ (Subject-Verb Agreement)",
  "Danh từ đếm được và không đếm được (Countable and Uncountable Nouns)",
  "Tính từ và trạng từ (Adjectives and Adverbs)",
  "Đại từ (Pronouns)",
  "Cụm động từ (Phrasal Verbs)",
  "Từ hạn định (Determiners)",
  "Liên từ (Conjunctions)",
  "Thán từ (Interjections)",
];

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  feedback: string;
};

export default function GrammarPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleTopicChange = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const checkAll = () => setSelectedTopics([...GRAMMAR_TOPICS]);
  const uncheckAll = () => setSelectedTopics([]);

  const API_KEY_STORAGE_KEY = "openai_api_key";

  const startQuiz = async () => {
    setLoading(true);
    setShowResult(false);
    setQuiz([]);
    setUserAnswers([]);

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
      alert(
        "Vui lòng nhập OpenAI API key trong phần cài đặt trước khi bắt đầu."
      );
      setLoading(false);
      return;
    }

    const prompt = `
      Bạn là giáo viên tiếng Anh. Tạo 10 câu hỏi trắc nghiệm (mỗi câu có 4 lựa chọn, chỉ có một câu trả lời đúng) để thực hành các chủ đề ngữ pháp sau: ${selectedTopics.join(
        ", "
      )}.
      Trả về kết quả dưới dạng mảng JSON với định dạng này:
      [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": 0 // index of correct option
          "feedback": "string" // Giải thích ngắn gọn, rõ ràng, dễ hiểu bằng tiếng việt về kết quả đúng
        },
        ...
      ]
      Không bao gồm bất kỳ giải thích hoặc văn bản bổ sung nào.
      `;

    try {
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
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: prompt },
            ],
            // temperature: 0.7,
            // max_tokens: 1800,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        alert("Lỗi khi gọi OpenAI API: " + error);
        setLoading(false);
        return;
      }

      const data = await response.json();
      let questions: QuizQuestion[] = [];
      try {
        const content = data.choices[0].message.content.trim();
        const start = content.indexOf("[");
        const end = content.lastIndexOf("]");
        const jsonString = content.slice(start, end + 1);
        questions = JSON.parse(jsonString);
      } catch {
        alert("Không thể phân tích câu hỏi từ phản hồi của AI.");
        setLoading(false);
        return;
      }

      setQuiz(questions);
      setUserAnswers(Array(questions.length).fill(-1));
    } catch {
      alert("Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const submitQuiz = () => {
    setShowResult(true);
  };

  return (
    <div className="w-full mx-auto p-8 flex flex-row flex-wrap justify-center gap-5">
      <Card className="p-6 max-w-2/5">
        <h1 className="text-2xl font-bold mb-3">Luyện tập ngữ pháp</h1>
        <Label htmlFor="grammar-topics" className="mb-2 block">
          Chọn ngữ pháp để thực hành:
        </Label>
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTopics.length === GRAMMAR_TOPICS.length}
                onChange={(e) => (e.target.checked ? checkAll() : uncheckAll())}
              />
              Chọn tất cả
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto border rounded p-2">
            {GRAMMAR_TOPICS.map((topic) => (
              <label
                key={topic}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={() => handleTopicChange(topic)}
                />
                {topic}
              </label>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-center py-4">
          Vui lòng chọn chủ đề và cài đặt API Key (nếu chưa có) để bắt đầu.
        </p>
        <Button
          onClick={startQuiz}
          disabled={selectedTopics.length === 0 || loading}
        >
          {loading ? "Đang tạo câu hỏi..." : "Bắt đầu"}
        </Button>
      </Card>

      {quiz.length > 0 && (
        <Card className="p-6 w-full max-w-1/2">
          <h2 className="text-xl font-semibold mb-4">Quiz</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuiz();
            }}
          >
            {quiz.map((q, qIdx) => (
              <div key={qIdx} className="mb-6">
                <div className="font-medium mb-2">
                  {qIdx + 1}. {q.question}
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-2 cursor-pointer ${
                        showResult
                          ? optIdx === q.answer
                            ? "text-green-600 font-bold"
                            : userAnswers[qIdx] === optIdx
                            ? "text-red-600"
                            : ""
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${qIdx}`}
                        value={optIdx}
                        checked={userAnswers[qIdx] === optIdx}
                        onChange={() => handleAnswer(qIdx, optIdx)}
                        disabled={showResult}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {showResult && (
                  <div className="mt-1 text-sm">
                    {userAnswers[qIdx] === q.answer ? (
                      <span className="text-green-600">Correct</span>
                    ) : (
                      <span className="text-red-600">Incorrect</span>
                    )}

                    <br />
                    <span>{q.feedback}</span>
                  </div>
                )}
              </div>
            ))}
            {!showResult && (
              <Button type="submit" className="mt-4">
                Submit
              </Button>
            )}
            {showResult && (
              <div className="mt-4 font-semibold">
                Score:{" "}
                {userAnswers.filter((a, i) => a === quiz[i].answer).length} /{" "}
                {quiz.length}
              </div>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}
