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
import { DEFAULT_READING_TOPIC } from "@/consts";

interface TopicSelectorProps {
  onTopicSelect: (topicId: string) => void;
  onGeneratePractice: () => void;
  selectedTopicId: string | null;
  level: string;
  onLevelChange: (level: string) => void;
  isGenerating: boolean;
  showPractice: boolean;
  isCompleted: boolean;
  cancelPractice: () => void;
  checkResult : (value: boolean) => void;
}

export function TopicSelector({
  onTopicSelect,
  onGeneratePractice,
  selectedTopicId,
  level,
  onLevelChange,
  isGenerating,
  showPractice,
  isCompleted,
  cancelPractice,
  checkResult
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const defaultTopics: Topic[] = DEFAULT_READING_TOPIC;
    setTopics(defaultTopics);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="w-fit flex flex-col">
        <label className="block text-sm font-medium mb-2">Chọn chủ đề</label>
        <Select
          value={selectedTopicId || ""}
          onValueChange={onTopicSelect}
          disabled={showPractice || isGenerating}
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
          disabled={showPractice || isGenerating}
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
      {showPractice && (
        <div className="flex justify-between">
          <div className="flex gap-2 justify-end">
              <Button onClick={cancelPractice} disabled={false}>
                Hủy
              </Button>
              <Button onClick={() => checkResult(!isCompleted)} disabled={false}>
                {isCompleted ? "Tiếp tục học" : "Kiểm tra"}
              </Button>
            </div>
        </div>
      )}
      {!showPractice && (
        <Button
          onClick={onGeneratePractice}
          disabled={!selectedTopicId || !level || showPractice || isGenerating}
        >
          Tạo bài tập
        </Button>
      )}
    </div>
  );
}
