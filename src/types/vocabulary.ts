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

export type VocabularyStudyType = "multiple_choice" | "writing";

export type WritingQuestion = {
  id: string;
  word: string;
  meaning: string;
  type: string;
};

