"use client";

import { LOCAL_STORAGE_KEY } from "@/consts";
import { AiKeyType, VocabularyType } from "@/types";
import { v4 as uuidv4 } from "uuid";

// AI KEY functions
export const getAiKey = (): AiKeyType => {
  const defaultValue : AiKeyType = {label: LOCAL_STORAGE_KEY.GEMINI_AI_TOKEN, value: ''};

  if (typeof window === "undefined") return defaultValue;

  const aiKey = localStorage.getItem(LOCAL_STORAGE_KEY.AI_KEY);
  return aiKey ? JSON.parse(aiKey) : defaultValue;
};
export const setAiKey = (value: AiKeyType) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_STORAGE_KEY.AI_KEY, JSON.stringify(value));
};

// Vocabulary functions
export const getVocabulary = (): VocabularyType[] => {
  if (typeof window === "undefined") return [];

  const vocabulary = localStorage.getItem(LOCAL_STORAGE_KEY.VOCABULARY);
  return vocabulary ? JSON.parse(vocabulary) : [];
};

export const saveVocabulary = (vocabulary: VocabularyType[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_STORAGE_KEY.VOCABULARY, JSON.stringify(vocabulary));
};

export const addVocabulary = (
  vocabulary: Omit<VocabularyType, "id" | "createdAt">
) => {
  const existingVocabulary = getVocabulary();
  const newVocabulary = {
    ...vocabulary,
    id: uuidv4(),
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
    ? localStorage.getItem(LOCAL_STORAGE_KEY.WRITING_HISTORY_PARAGRAPH)
    : localStorage.getItem(LOCAL_STORAGE_KEY.READING_HISTORY_PARAGRAPH);
  return historyParagraph ? JSON.parse(historyParagraph) : [];
};

export const saveHistoryParagraph = (
  isWriting: boolean,
  historyParagraph: string[]
): string[] => {
  if (typeof window === "undefined") return [];

  localStorage.setItem(
    isWriting ? LOCAL_STORAGE_KEY.WRITING_HISTORY_PARAGRAPH : LOCAL_STORAGE_KEY.READING_HISTORY_PARAGRAPH,
    JSON.stringify(historyParagraph)
  );
  return historyParagraph ?? [];
};
