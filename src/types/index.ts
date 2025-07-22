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

export type WritingQuestion = {
  id: string;
  word: string;
  meaning: string;
};

export type Topic = {
  id: string;
  name: string;
};

export type Question = {
  label: string;
  answers: string[];
  trueAnsswer: number;
  explain: string;
};

export type ReadingPracticeType = {
  paragraph: string;
  questions: Question[];
};
