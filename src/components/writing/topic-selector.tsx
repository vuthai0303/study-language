"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topic } from "@/types";
import { DEFAULT_WRITING_TOPIC } from "@/consts";
import { Textarea } from "../ui/textarea";

interface TopicSelectorProps {
  onTopicSelect: (topicId: string) => void;
  onGenerateParagraph: (paragraph : string | null) => void;
  showTranslationPractice: boolean;
  isGenerating: boolean;
  selectedTopicId: string | null;
  level: string;
  onLevelChange: (level: string) => void;
}

export function TopicSelector({
  onTopicSelect,
  onGenerateParagraph,
  showTranslationPractice,
  isGenerating,
  selectedTopicId,
  level,
  onLevelChange,
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [paragraph, setParagraph] = useState<string>("");

  useEffect(() => {
    const defaultTopics: Topic[] = DEFAULT_WRITING_TOPIC;
    setTopics(defaultTopics);
  }, []);

  const generateParagraph = () => {
    if (selectedTopicId == "-1" && paragraph.length > 0) {
      onGenerateParagraph(paragraph);
    } else {
      onGenerateParagraph(null);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row flex-wrap gap-4 items-end">
        <div className="w-fit flex flex-col">
          <label className="block text-sm font-medium mb-2">Chọn chủ đề</label>
          <Select
            value={selectedTopicId || ""}
            onValueChange={onTopicSelect}
            disabled={isGenerating || showTranslationPractice}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-fit flex flex-col">
          <label className="block text-sm font-medium mb-2">Chọn trình độ</label>
          <Select
            value={level}
            onValueChange={onLevelChange}
            disabled={isGenerating || showTranslationPractice}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trình độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cơ bản">Cơ bản</SelectItem>
              <SelectItem value="Trung cấp">Trung cấp</SelectItem>
              <SelectItem value="Chuyên nghiệp">Chuyên nghiệp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={generateParagraph}
          disabled={!selectedTopicId || isGenerating || showTranslationPractice}
        >
          {isGenerating ? "Đang tạo..." : "Tạo đoạn văn"}
        </Button>
      </div>
      {
        selectedTopicId == "-1" && (
        <div className="py-3">
          <Textarea
            value={paragraph}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setParagraph(e.target.value)
            }
            placeholder="Nhập nội dung muốn luyện tập dịch..."
            disabled={selectedTopicId != "-1" || showTranslationPractice}
            className="min-h-[100px]"
          />
        </div>)
      }
    </div>
  );
}
