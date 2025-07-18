export type VocabularyType = {
  id: string;
  word: string;
  type: string;
  meaning: string;
  createdAt: string;
  status: "to_learn" | "learning" | "mastered";
};

export type VocabularyStudyType = "multiple choice" | "writing";

export type Topic = {
  id: string;
  name: string;
};
