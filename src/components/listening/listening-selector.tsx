"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_LISTENING_TOPIC } from "@/consts";
import { Topic } from "@/types";
import { ListeningLevel } from "@/types/listening";

interface ListeningSelectorProps {
  level: ListeningLevel;
  onLevelChange: (level: ListeningLevel) => void;
  selectedTopicId: string;
  onTopicChange: (topicId: string) => void;
  showPractice: boolean;
  isGenerating: boolean;
  onGeneratePractice: () => void;
  onCancelPractice: () => void;
}

export function ListeningSelector({
  level,
  onLevelChange,
  selectedTopicId,
  onTopicChange,
  showPractice,
  isGenerating,
  onGeneratePractice,
  onCancelPractice,
}: ListeningSelectorProps) {
  const topics: Topic[] = DEFAULT_LISTENING_TOPIC;
  const showTopicSelect = level === "Chuyên nghiệp";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3 md:items-end">
        <div className="flex flex-col">
          <label className="mb-2 block text-sm font-medium">Chọn trình độ</label>
          <Select
            value={level}
            onValueChange={(value) => onLevelChange(value as ListeningLevel)}
            disabled={isGenerating || showPractice}
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

        {showTopicSelect ? (
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium">Chọn chủ đề</label>
            <Select
              value={selectedTopicId}
              onValueChange={onTopicChange}
              disabled={isGenerating || showPractice}
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
        ) : (
          <div className="hidden md:block" />
        )}

        <div className="flex items-end md:justify-end">
          {!showPractice ? (
            <Button
              className="w-full md:w-auto"
              onClick={onGeneratePractice}
              disabled={isGenerating}
            >
              {isGenerating ? "Đang tạo..." : "Tạo bài tập"}
            </Button>
          ) : (
            <Button
              className="w-full md:w-auto"
              variant="outline"
              onClick={onCancelPractice}
            >
              Hủy bài
            </Button>
          )}
        </div>
      </div>

      {showTopicSelect && (
        <p className="text-sm text-muted-foreground">
          Trình độ Chuyên nghiệp sẽ dùng thêm chủ đề đã chọn để tạo bài nghe sát nội
          dung hơn.
        </p>
      )}
    </div>
  );
}
