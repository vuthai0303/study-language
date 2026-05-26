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

