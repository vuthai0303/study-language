"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_READING_TOPIC } from "@/consts";
import { Topic } from "@/types";
import { useEffect, useState } from "react";

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
    <div className="flex flex-row flex-wrap gap-y-4 md:gap-x-4 items-end">
      <div className="order-1 w-1/2 md:w-fit flex flex-col">
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
      <div className="order-1 w-1/2 md:w-fit flex flex-col">
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
        <div className="order-2 w-full md:w-fit flex justify-between">
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
          className="order-2 w-full md:w-fit"
          onClick={onGeneratePractice}
          disabled={!selectedTopicId || !level || showPractice || isGenerating}
        >
          Tạo bài tập
        </Button>
      )}
    </div>
  );
}
