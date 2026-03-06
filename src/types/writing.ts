export type Feedback = {
  message: string;
  vocabs: { word: string; type: string; meaning: string }[];
  scope: number;
};

export type Sentence = {
  id: number;
  text: string;
  translation: string;
  feedback: Feedback | null;
  isCorrect: boolean | null;
};