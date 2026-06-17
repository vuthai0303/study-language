"use client";

import { LOCAL_STORAGE_KEY } from "@/consts";
import { AiKeyType } from "@/types/ai";
import { VocabularyType } from "@/types/vocabulary";
import { v4 as uuidv4 } from "uuid";

const isValidVocabularyStatus = (
  status: unknown
): status is VocabularyType["status"] =>
  status === "to_learn" || status === "learning" || status === "mastered";

const normalizeVocabulary = (value: unknown): VocabularyType | null => {
  if (!value || typeof value !== "object") return null;

  const vocabulary = value as Record<string, unknown>;
  if (
    typeof vocabulary.id !== "string" ||
    typeof vocabulary.word !== "string" ||
    typeof vocabulary.type !== "string" ||
    typeof vocabulary.meaning !== "string"
  ) {
    return null;
  }

  return {
    id: vocabulary.id,
    word: vocabulary.word,
    type: vocabulary.type,
    meaning: vocabulary.meaning,
    status: isValidVocabularyStatus(vocabulary.status)
      ? vocabulary.status
      : "to_learn",
    level: typeof vocabulary.level === "number" ? vocabulary.level : 0,
  };
};

// AI KEY functions
export const getLocalStoreAiKey = (): AiKeyType => {
  const defaultValue : AiKeyType = {provider: "OPENAI", key: "", model: "gpt-5.4-mini-2026-03-17"};

  if (typeof window === "undefined") return defaultValue;

  const aiKey = localStorage.getItem(LOCAL_STORAGE_KEY.AI_CONFIG);
  return aiKey ? JSON.parse(aiKey) : defaultValue;
};
export const setLocalStoreAiKey = (value: AiKeyType) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_STORAGE_KEY.AI_CONFIG, JSON.stringify(value));
};

// Vocabulary functions
export const getLocalVocabulary = (): VocabularyType[] => {
  if (typeof window === "undefined") return [];

  try {
    const vocabulary = localStorage.getItem(LOCAL_STORAGE_KEY.VOCABULARY);
    if (!vocabulary) return [];

    const parsed = JSON.parse(vocabulary);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeVocabulary).filter(
      (item): item is VocabularyType => item !== null
    );
  } catch (error) {
    console.error("Failed to parse local vocabulary:", error);
    return [];
  }
};

export const saveLocalVocabulary = (vocabulary: VocabularyType[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_STORAGE_KEY.VOCABULARY, JSON.stringify(vocabulary));
};

export const addLocalVocabulary = (
  vocabulary: Omit<VocabularyType, "id">
) => {
  const existingVocabulary = getLocalVocabulary();
  const newVocabulary = {
    id: uuidv4(),
    ...vocabulary,
  };

  saveLocalVocabulary([...existingVocabulary, newVocabulary]);
  return newVocabulary;
};

export const addLocalVocabularyList = (
  vocabularyList: Omit<VocabularyType, "id">[]
) => {
  const existingVocabulary = getLocalVocabulary();
  const newVocabularyList = vocabularyList.map((vocabulary) => ({
    ...vocabulary,
    id: uuidv4(),
  }));
  
  saveLocalVocabulary([...existingVocabulary, ...newVocabularyList]);
  return newVocabularyList;
};

export const updateLocalVocabulary = (vocabulary: VocabularyType) => {
  const existingVocabulary = getLocalVocabulary();
  const updatedVocabulary = existingVocabulary.map((item) =>
    item.id === vocabulary.id ? vocabulary : item
  );

  saveLocalVocabulary(updatedVocabulary);
  return vocabulary;
};

export const deleteLocalVocabulary = (id: string) => {
  const existingVocabulary = getLocalVocabulary();
  const updatedVocabulary = existingVocabulary.filter((item) => item.id !== id);

  saveLocalVocabulary(updatedVocabulary);
};

// history paragraph function
export const getLocalHistoryParagraph = (isWriting: boolean): string[] => {
  if (typeof window === "undefined") return [];

  const historyParagraph = isWriting
    ? localStorage.getItem(LOCAL_STORAGE_KEY.WRITING_HISTORY_PARAGRAPH)
    : localStorage.getItem(LOCAL_STORAGE_KEY.READING_HISTORY_PARAGRAPH);
  return historyParagraph ? JSON.parse(historyParagraph) : [];
};

export const saveLocalHistoryParagraph = (
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
