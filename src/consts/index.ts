import { VocabularyStudyType, VocabularyType, Topic } from "@/types";

export const TYPE_VOCAB_LABELS = [
  { id: "noun", name: "Danh từ (Noun)" },
  { id: "verb", name: "Động từ (Verb)" },
  { id: "adjective", name: "Tính từ (Adjective)" },
  { id: "adverb", name: "Trạng từ (Adverb)" },
  { id: "preposition", name: "Giới từ (Preposition)" },
  { id: "conjunction", name: "Liên từ (Conjunction)" },
  { id: "pronoun", name: "Đại từ (Pronoun)" },
  { id: "phrase", name: "Cụm từ (Phrase)" },
];

export const STATUS_LABELS: Record<VocabularyType["status"], string> = {
  to_learn: "Cần học",
  learning: "Đang học",
  mastered: "Đã thuộc",
};

export const STUDY_LABELS: Record<VocabularyStudyType, string> = {
  multiple_choice: "Trắc nghiệm",
  writing: "Viết",
};

export const DEFAULT_WRITING_TOPIC: Topic[] = [
  { id: "0", name: "Sách / Tiểu thuyết" },
  { id: "1", name: "Du lịch" },
  { id: "2", name: "Công nghệ" },
  { id: "3", name: "Giáo dục" },
  { id: "4", name: "Sức khỏe" },
  { id: "5", name: "Thể thao" },
  { id: "6", name: "Công việc" },
  { id: "7", name: "Giới thiệu bản thân" },
  { id: "8", name: "Phỏng vấn" },
];

export const DEFAULT_READING_TOPIC: Topic[] = [
  { id: "0", name: "Sách / Tiểu thuyết" },
  { id: "1", name: "Du lịch" },
  { id: "2", name: "Công nghệ" },
  { id: "3", name: "Giáo dục" },
  { id: "4", name: "Sức khỏe" },
  { id: "5", name: "Thể thao" },
  { id: "6", name: "Công việc" },
];
