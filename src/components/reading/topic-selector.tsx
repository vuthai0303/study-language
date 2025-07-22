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
import { getTopics, initializeDefaultTopics } from "@/lib/localStorage";

interface TopicSelectorProps {
  onTopicSelect: (topicId: string) => void;
  onGeneratePractice: () => void;
  isGenerating: boolean;
  selectedTopicId: string | null;
  level: string;
  onLevelChange: (level: string) => void;
}

export function TopicSelector({
  onTopicSelect,
  onGeneratePractice,
  isGenerating,
  selectedTopicId,
  level,
  onLevelChange,
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // Initialize default topics if none exist
    initializeDefaultTopics();

    // Load topics
    const loadedTopics = getTopics();
    setTopics(loadedTopics);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="w-fit flex flex-col">
        <label className="block text-sm font-medium mb-2">Chọn chủ đề</label>
        <Select
          value={selectedTopicId || ""}
          onValueChange={onTopicSelect}
          disabled={isGenerating}
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
          disabled={isGenerating}
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
        onClick={onGeneratePractice}
        disabled={!selectedTopicId || isGenerating}
      >
        {isGenerating ? "Đang tạo..." : "Tạo bài tập"}
      </Button>
    </div>
  );
}
