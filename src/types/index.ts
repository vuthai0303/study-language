export type VocabularyType = {
  id: string;
  word: string;
  type: string;
  meaning: string;
  createdAt: string;
  status: "to_learn" | "learning" | "mastered";
};

export type QuizQuestion = {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
};

export type QuizResult = {
  total: number;
  correct: number;
  incorrect: number;
};

export type VocabularyStudyType = "multiple_choice" | "writing";

export type Topic = {
  id: string;
  name: string;
};
