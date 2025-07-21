import { VocabularyStudyType, VocabularyType } from "@/types";

export const STATUS_LABELS: Record<VocabularyType["status"], string> = {
  to_learn: "Cần học",
  learning: "Đang học",
  mastered: "Đã thuộc",
};

export const STUDY_LABELS: Record<VocabularyStudyType, string> = {
  multiple_choice: "Trắc nghiệm",
  writing: "Viết",
};
