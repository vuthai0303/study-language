export type VocabularyType = {
  id: string;
  word: string;
  type: string;
  meaning: string;
  createdAt: string;
  status: "to_learn" | "learning" | "mastered";
  level: number;
};

export type QuizQuestion = {
  id: string;
  word: string;
  correctAnswer: string;
  options: VocabularyType[];
};

export type QuizResult = {
  total: number;
  correct: number;
  incorrect: number;
};

export type VocabularyStudyType = "multiple_choice" | "writing" | "sentence";

export type StudyDirection = "en_to_vi" | "vi_to_en";

export type WritingQuestion = {
  id: string;
  word: string;
  meaning: string;
  type: string;
};

export type SentenceQuestion = {
  id: string;
  englishSentence: string;
  vietnameseSentence: string;
  options: string[];     // 4 đáp án (Việt khi en→vi, Anh khi vi→en)
  correctAnswer: string; // đáp án đúng
};
