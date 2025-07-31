"use client";

import { VocabularyType } from "@/types";

// Vocabulary functions
export const getVocabulary = (): VocabularyType[] => {
  if (typeof window === "undefined") return [];

  const vocabulary = localStorage.getItem("vocabulary");
  return vocabulary ? JSON.parse(vocabulary) : [];
};

export const saveVocabulary = (vocabulary: VocabularyType[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("vocabulary", JSON.stringify(vocabulary));
};

export const addVocabulary = (
  vocabulary: Omit<VocabularyType, "id" | "createdAt">
) => {
  const existingVocabulary = getVocabulary();
  const newVocabulary = {
    ...vocabulary,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  saveVocabulary([...existingVocabulary, newVocabulary]);
  return newVocabulary;
};

export const updateVocabulary = (vocabulary: VocabularyType) => {
  const existingVocabulary = getVocabulary();
  const updatedVocabulary = existingVocabulary.map((item) =>
    item.id === vocabulary.id ? vocabulary : item
  );

  saveVocabulary(updatedVocabulary);
  return vocabulary;
};

export const deleteVocabulary = (id: string) => {
  const existingVocabulary = getVocabulary();
  const updatedVocabulary = existingVocabulary.filter((item) => item.id !== id);

  saveVocabulary(updatedVocabulary);
};

// history paragraph function
export const getHistoryParagraph = (isWriting: boolean): string[] => {
  if (typeof window === "undefined") return [];

  const historyParagraph = isWriting
    ? localStorage.getItem("writing_history_paragraph")
    : localStorage.getItem("reading_history_paragraph");
  return historyParagraph ? JSON.parse(historyParagraph) : [];
};

export const saveHistoryParagraph = (
  isWriting: boolean,
  historyParagraph: string[]
): string[] => {
  if (typeof window === "undefined") return [];

  localStorage.setItem(
    isWriting ? "writing_history_paragraph" : "reading_history_paragraph",
    JSON.stringify(historyParagraph)
  );
  return historyParagraph ?? [];
};
