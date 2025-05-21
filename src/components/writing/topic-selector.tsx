"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Topic } from "@/types";
import { getTopics, initializeDefaultTopics } from "@/lib/localStorage";

interface TopicSelectorProps {
  onTopicSelect: (topicId: string) => void;
  onGenerateParagraph: () => void;
  isGenerating: boolean;
  selectedTopicId: string | null;
}

export function TopicSelector({
  onTopicSelect,
  onGenerateParagraph,
  isGenerating,
  selectedTopicId,
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
      <div className="w-full md:w-64">
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
      <Button
        onClick={onGenerateParagraph}
        disabled={!selectedTopicId || isGenerating}
      >
        {isGenerating ? "Đang tạo..." : "Tạo đoạn văn"}
      </Button>
    </div>
  );
}