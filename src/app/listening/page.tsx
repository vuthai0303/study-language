"use client";

import { ListeningPractice } from "@/components/listening/listening-practice";
import { ListeningSelector } from "@/components/listening/listening-selector";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_LISTENING_TOPIC } from "@/consts";
import { useAI } from "@/hooks/useAI";
import {
  getLocalListeningHistoryParagraph,
  getLocalVocabulary,
  saveLocalListeningHistoryParagraph,
} from "@/lib/localStorage";
import { CallAiResponse } from "@/types/ai";
import { Topic } from "@/types";
import {
  ListeningLevel,
  ListeningPracticeType,
  ListeningQuestion,
  ListeningSegment,
} from "@/types/listening";
import { VocabularyType } from "@/types/vocabulary";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RawListeningQuestion = {
  id?: string;
  prompt?: string;
  audioText?: string;
  transcript?: string;
  options?: string[];
  answerIndex?: number;
  explanation?: string;
  segmentId?: number;
};

type RawListeningSegment = {
  id?: number;
  title?: string;
  subtitle?: string;
  audioText?: string;
  transcript?: string;
};

type RawListeningPractice = {
  title?: string;
  topic?: string;
  level?: ListeningLevel;
  fullTranscript?: string;
  segments?: RawListeningSegment[];
  questions?: RawListeningQuestion[];
};

const normalizeVocabularyForPrompt = (items: VocabularyType[]) => {
  const source = items.filter((item) => item.status !== "mastered");
  const selected = source.length > 0 ? source : items;

  return selected.slice(0, 30).map((item) => ({
    word: item.word,
    type: item.type,
    meaning: item.meaning,
    status: item.status,
    level: item.level,
  }));
};

const extractJsonObject = (content: string) => {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return trimmed.slice(start, end + 1);
};

const defaultListeningPromptTopics: Topic[] = DEFAULT_LISTENING_TOPIC;

export default function ListeningPage() {
  const { callAI, isHasKey } = useAI();
  const [level, setLevel] = useState<ListeningLevel>("Trung cấp");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    defaultListeningPromptTopics[0]?.id ?? "0"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPractice, setGeneratedPractice] =
    useState<ListeningPracticeType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [historyParagraph, setHistoryParagraph] = useState<string[]>([]);
  const [vocabularies, setVocabularies] = useState<VocabularyType[]>([]);

  useEffect(() => {
    setHistoryParagraph(getLocalListeningHistoryParagraph());
    setVocabularies(getLocalVocabulary());
  }, []);

  const selectedTopic = useMemo(
    () => defaultListeningPromptTopics.find((topic) => topic.id === selectedTopicId),
    [selectedTopicId]
  );

  const handleLevelChange = (nextLevel: ListeningLevel) => {
    setLevel(nextLevel);
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopicId(topicId);
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);
  };

  const buildSystemPrompt = () =>
    [
      "Bạn là giáo viên tiếng Anh chuyên thiết kế bài luyện nghe.",
      "Chỉ trả về JSON thuần, không markdown, không chú thích ngoài JSON.",
      "Nội dung tiếng Anh phải tự nhiên, có ý nghĩa, phù hợp với trình độ được yêu cầu.",
      "Phần giải thích phải bằng tiếng Việt.",
      "Các câu hỏi và đáp án phải gây nhiễu hợp lý nhưng vẫn tự nhiên.",
    ].join(" ");

  const buildPrompt = () => {
    const vocabularyPayload = normalizeVocabularyForPrompt(vocabularies);
    const historyPayload = historyParagraph.join("\n");

    if (level === "Cơ bản") {
      return `
Hãy tạo 10 câu hỏi luyện nghe cho trình độ Cơ bản.

Yêu cầu:
- Mỗi câu là 1 câu hỏi bằng tiếng Anh ngắn, tự nhiên, có ý nghĩa.
- Chỉ ẩn 1 từ quan trọng bằng dấu "_"; đáp án đúng là từ bị thiếu và câu trả lời hợp lý cho câu hỏi.
- Khi người dùng nghe audioText, hệ thống sẽ đọc toàn bộ câu tiếng Anh.
- Mỗi câu có 4 đáp án ngắn, trong đó 1 đáp án là từ bị thiếu và câu trả lời hợp lý cho câu hỏi và 3 đáp án còn lại là từ và câu trả lời gây nhiễu hợp lý.
- Đáp án sai phải hợp lý và tự nhiên.
- transcript là câu hoàn chỉnh sau khi điền đáp án.
- explanation bằng tiếng Việt, ngắn gọn, rõ ràng.
- Gợi ý sử dụng các từ vựng đang học nếu phù hợp.

Định dạng JSON:
{
  "title": "string",
  "topic": "string",
  "level": "Cơ bản",
  "questions": [
    {
      "id": "q1",
      "prompt": "string",
      "audioText": "string",
      "transcript": "string",
      "options": ["string", "string", "string", "string"],
      "answerIndex": 0,
      "explanation": "string"
    }
  ]
}

Từ vựng đang học tham khảo:
${JSON.stringify(vocabularyPayload)}

Bài luyện nghe trước đó để tránh lặp:
${historyPayload}
`.trim();
    }

    if (level === "Trung cấp") {
      return `
Hãy tạo 10 câu hỏi luyện nghe cho trình độ Trung cấp.

Yêu cầu:
- Mỗi câu hỏi là một đoạn văn riêng gồm khoảng 3-4 câu tiếng Anh.
- Người dùng chỉ nghe audioText của đoạn văn và chọn đáp án cho câu hỏi đi kèm.
- Trước khi nộp bài, chỉ hiển thị nút phát âm thanh và câu hỏi.
- Sau khi nộp bài, hiển thị thêm transcript của đoạn văn.
- Mỗi câu hỏi có 4 đáp án.
- Đáp án sai phải tự nhiên và gây nhiễu tốt.
- explanation bằng tiếng Việt, ngắn gọn, dễ hiểu.
- Gợi ý sử dụng các từ vựng đang học nếu phù hợp.

Định dạng JSON:
{
  "title": "string",
  "topic": "string",
  "level": "Trung cấp",
  "questions": [
    {
      "id": "q1",
      "prompt": "string",
      "audioText": "string",
      "transcript": "string",
      "options": ["string", "string", "string", "string"],
      "answerIndex": 0,
      "explanation": "string"
    }
  ]
}

Từ vựng đang học tham khảo:
${JSON.stringify(vocabularyPayload)}

Bài luyện nghe trước đó để tránh lặp:
${historyPayload}
`.trim();
    }

    return `
Hãy tạo một bài luyện nghe trình độ Chuyên nghiệp theo phong cách TED Talk.

Yêu cầu:
- Chọn chủ đề: ${selectedTopic?.name ?? "Tự do"}
- Bài nghe gồm 3 phần riêng biệt, mỗi phần tương ứng với 3 câu hỏi đầu tiên của nhóm câu hỏi.
- Câu 10 dựa trên toàn bộ nội dung bài nghe.
- Mỗi phần phải có 3-4 câu tiếng Anh tự nhiên, chặt chẽ, có ý nghĩa.
- Trước khi nộp bài, chỉ hiển thị nút phát từng phần và câu hỏi.
- Sau khi nộp bài, hiển thị transcript đầy đủ của cả bài.
- Câu hỏi và đáp án phải khó hơn, có tính đánh đố, gây nhiễu hợp lý nhưng vẫn tự nhiên.
- Mỗi câu hỏi có 4 đáp án.
- explanation bằng tiếng Việt, ngắn gọn nhưng đủ để hiểu tại sao đáp án đúng.
- Gợi ý sử dụng các từ vựng đang học nếu phù hợp.

Định dạng JSON:
{
  "title": "string",
  "topic": "string",
  "level": "Chuyên nghiệp",
  "fullTranscript": "string",
  "segments": [
    {
      "id": 1,
      "title": "Phần 1",
      "subtitle": "Câu 1-3",
      "audioText": "string",
      "transcript": "string"
    },
    {
      "id": 2,
      "title": "Phần 2",
      "subtitle": "Câu 4-6",
      "audioText": "string",
      "transcript": "string"
    },
    {
      "id": 3,
      "title": "Phần 3",
      "subtitle": "Câu 7-9",
      "audioText": "string",
      "transcript": "string"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "prompt": "string",
      "audioText": "string",
      "transcript": "string",
      "options": ["string", "string", "string", "string"],
      "answerIndex": 0,
      "explanation": "string",
      "segmentId": 1
    }
  ]
}

Từ vựng đang học tham khảo:
${JSON.stringify(vocabularyPayload)}

Bài luyện nghe trước đó để tránh lặp:
${historyPayload}
`.trim();
  };

  const normalizeQuestions = (questions: RawListeningQuestion[]): ListeningQuestion[] =>
    questions.slice(0, 10).map((question, index) => {
      const options = Array.isArray(question.options)
        ? question.options.filter(
          (option): option is string =>
            typeof option === "string" && option.trim().length > 0
        )
        : [];

      return {
        id: question.id ?? `q${index + 1}`,
        prompt: question.prompt ?? "",
        audioText: question.audioText ?? "",
        transcript: question.transcript ?? "",
        options: options.slice(0, 4),
        answerIndex: typeof question.answerIndex === "number" ? question.answerIndex : 0,
        explanation: question.explanation ?? "",
        segmentId: typeof question.segmentId === "number" ? question.segmentId : undefined,
      };
    });

  const normalizeSegments = (
    segments: RawListeningSegment[] | undefined
  ): ListeningSegment[] =>
    (segments ?? []).slice(0, 3).map((segment, index) => ({
      id: segment.id ?? index + 1,
      title: segment.title ?? `Phần ${index + 1}`,
      subtitle: segment.subtitle ?? `Câu ${index * 3 + 1}-${index * 3 + 3}`,
      audioText: segment.audioText ?? "",
      transcript: segment.transcript ?? "",
    }));

  const handleGeneratePractice = async () => {
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);

    if (!isHasKey()) {
      setErrorMessage("Vui lòng cài đặt AI key trong mục Cài đặt trước khi bắt đầu.");
      return;
    }

    if (level === "Chuyên nghiệp" && !selectedTopic) {
      setErrorMessage("Vui lòng chọn chủ đề cho bài nghe Chuyên nghiệp.");
      return;
    }

    setIsGenerating(true);

    try {
      const response: CallAiResponse = await callAI(buildPrompt(), buildSystemPrompt());

      if (!response.isSuccess || !response.data) {
        setErrorMessage("Không tạo được bài nghe. Vui lòng thử lại sau.");
        return;
      }

      const content = response.data.text ?? "";
      const jsonText = extractJsonObject(content);

      if (!jsonText) {
        setErrorMessage("Không nhận được JSON hợp lệ từ AI.");
        return;
      }

      const parsed = JSON.parse(jsonText) as RawListeningPractice;
      const questions = normalizeQuestions(parsed.questions ?? []);

      if (questions.length !== 10) {
        setErrorMessage("Bài nghe trả về chưa đủ 10 câu hỏi hợp lệ.");
        return;
      }

      if (
        questions.some(
          (question) => question.options.length !== 4 || question.answerIndex < 0 || question.answerIndex > 3
        )
      ) {
        setErrorMessage("Một số câu hỏi chưa có đủ 4 đáp án hợp lệ.");
        return;
      }

      const segments = normalizeSegments(parsed.segments);
      const practice: ListeningPracticeType = {
        title: parsed.title ?? "Bài luyện nghe",
        topic: parsed.topic ?? selectedTopic?.name ?? "Tổng hợp",
        level: parsed.level ?? level,
        fullTranscript: parsed.fullTranscript ?? "",
        segments,
        questions,
      };

      setGeneratedPractice(practice);
      setShowPractice(true);

      const historySource = [
        practice.fullTranscript,
        ...(practice.segments ?? []).map((segment) => segment.transcript),
        ...practice.questions.map((question) => question.transcript),
      ]
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .join(" ");

      setHistoryParagraph(
        saveLocalListeningHistoryParagraph([historySource, ...historyParagraph].slice(0, 10))
      );
    } catch (error) {
      console.error("Error generating listening practice:", error);
      setErrorMessage("Có lỗi xảy ra khi tạo bài nghe. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetPractice = () => {
    setGeneratedPractice(null);
    setErrorMessage(null);
    setShowPractice(false);
  };

  return (
    <div className="container mx-auto flex flex-col gap-4 px-2 py-6 md:px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Học nghe Tiếng Anh</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Chọn trình độ, tạo bài nghe bằng AI và làm bài trực tiếp trên trình duyệt.
          Bài học sẽ tự động bám theo từ vựng bạn đang học.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <ListeningSelector
            level={level}
            onLevelChange={handleLevelChange}
            selectedTopicId={selectedTopicId}
            onTopicChange={handleTopicChange}
            showPractice={showPractice}
            isGenerating={isGenerating}
            onGeneratePractice={handleGeneratePractice}
            onCancelPractice={handleResetPractice}
          />

          {isGenerating && (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tạo bài nghe...
            </div>
          )}

          {errorMessage && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {!isHasKey() && !errorMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Vui lòng cài đặt AI key trong mục Cài đặt để bắt đầu.
            </div>
          )}
        </CardContent>
      </Card>

      {showPractice && generatedPractice && (
        <ListeningPractice
          practice={generatedPractice}
          level={level}
          onReset={handleResetPractice}
        />
      )}
    </div>
  );
}


