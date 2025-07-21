"use client";
import { VocabularyType } from "@/types";

interface VocabularyWritingStudyProps {
  vocabulary: VocabularyType[];
  selectedStatus: VocabularyType["status"];
  quizStarted: boolean;
  onRefresh: () => void;
  startQuiz: () => void;
  onCloseQuiz: () => void;
}

export function VocabularyWritingStudy({
  vocabulary,
  selectedStatus,
  quizStarted,
  onRefresh,
  startQuiz,
  onCloseQuiz,
}: VocabularyWritingStudyProps) {
  return <div>test</div>;
}
