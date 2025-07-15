"use client";

import { VocabularyType, Topic } from "@/types";

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

// Topics functions
export const getTopics = (): Topic[] => {
  if (typeof window === "undefined") return [];

  const topics = localStorage.getItem("topics");
  return topics ? JSON.parse(topics) : [];
};

export const saveTopics = (topics: Topic[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("topics", JSON.stringify(topics));
};

export const addTopic = (name: string) => {
  const existingTopics = getTopics();
  const newTopic = {
    id: Date.now().toString(),
    name,
  };

  saveTopics([...existingTopics, newTopic]);
  return newTopic;
};

// Initialize default topics if none exist
export const initializeDefaultTopics = () => {
  const existingTopics = getTopics();

  if (existingTopics.length === 0) {
    const defaultTopics: Topic[] = [
      { id: "1", name: "Du lịch" },
      { id: "2", name: "Công nghệ" },
      { id: "3", name: "Giáo dục" },
      { id: "4", name: "Sức khỏe" },
      { id: "5", name: "Thể thao" },
      { id: "6", name: "Công việc" },
      { id: "7", name: "Giới thiệu bản thân" },
    ];

    saveTopics(defaultTopics);
  }
};
