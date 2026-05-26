"use client";

import { Button } from "@/components/ui/button";
import { STUDY_LABELS } from "@/consts";
import { getLocalVocabulary } from "@/lib/localStorage";
import { VocabularyStudyType, VocabularyType } from "@/types/vocabulary";
import { useEffect, useState } from "react";
import { VocabularyMultiChoiceStudy } from "./vocabulary-study/multi-choice";
import { VocabularyWritingStudy } from "./vocabulary-study/writing";

// Weighted shuffle function that favors lower level words
// alpha controls how much more likely lower level words are chosen (0.7 is a good starting point)
// alpha = 0 means pure random, higher alpha means more bias towards lower levels
const weightedShuffleByLevel = (vocabylaries: VocabularyType[], alpha = 0.7) => {
  return [...vocabylaries].map(item => {
    const statusLevel = item.status === "mastered" ? 2 : item.status === "learning" ? 1 : 0;
    const level = (item?.level ?? 0) + statusLevel * 10; // Ensure mastered words are weighted lower than learning and learning words are weighted lower than to_learn
    // The lower the level, the higher the weight.
    //   level 0: weight = 1
    //   level 1: weight lower level 0
    //   level 2: weight lower level 1
    const weight = Math.exp(-alpha * level);
    // Efraimidis-Spirakis weighted random key
    const key = -Math.log(Math.random()) / weight;
    return { item, key };
  }).sort((a, b) => a.key - b.key).map(entry => entry.item);
}

/**
 * Select 10 words for practice based on weighted shuffle by level (the lower level, the higher the chance of being selected at the top of the list):
 * - If total vocabulary >= 10, select 7 first words in list, 3 end words in list
 * - If total vocabulary < 10, random list and select all
 */
function selectStudyVocabulary(vocabularies: VocabularyType[]): VocabularyType[] {
  if (vocabularies.length <= 10) {
    // If total words less than or equal to 10, shuffle all and return
    return [...vocabularies].sort(() => 0.5 - Math.random());
  }

  // Shuffle weighted list
  const shuffledWeightedVocabularies = weightedShuffleByLevel(vocabularies, 0.3);

  // Combine and shuffle final selection
  return [...shuffledWeightedVocabularies.slice(0, 7), ...shuffledWeightedVocabularies.slice(-3)];
}

export function VocabularyStudy() {
  const [vocabulary, setVocabulary] = useState<VocabularyType[]>([]);
  const [studyVocabulary, setStudyVocabulary] = useState<VocabularyType[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedStudyType, setSelectedStudyType] =
    useState<VocabularyStudyType>("multiple_choice");

  const loadVocabulary = () => {
    const data = getLocalVocabulary();
    setVocabulary(data);
  };

  useEffect(() => {
    loadVocabulary();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const startQuiz = () => {
    // Reload fresh data before starting
    const freshData = getLocalVocabulary();

    if (
      selectedStudyType == "multiple_choice" &&
      freshData.length < 4
    ) {
      alert("Bạn cần có ít nhất 4 từ vựng để bắt đầu học!");
      return;
    }

    const selectedVocabulary = selectStudyVocabulary(freshData);
    setStudyVocabulary(selectedVocabulary);
    setQuizStarted(true);
  };

  const onCloseQuiz = () => {
    setStudyVocabulary([]);
    setQuizStarted(false);
    loadVocabulary();
  };

  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Học từ vựng</h2>
        <p className="text-center mb-6">
          Hệ thống sẽ tự động chọn từ vựng dựa theo mức độ thành thạo (level) của bạn.
          <br />
          <span className="text-sm text-muted-foreground">
            7 từ có level thấp nhất + 3 từ có level cao nhất sẽ được chọn để luyện tập.
          </span>
        </p>
        <div className="mb-4 flex flex-col md:flex-row gap-2">
          <label htmlFor="study-type-select" className="mr-2 font-medium">
            Chọn chế độ học:
          </label>
          <select
            id="study-type-select"
            value={selectedStudyType}
            onChange={(e) =>
              setSelectedStudyType(e.target.value as VocabularyStudyType)
            }
            className="border rounded px-2 py-1"
          >
            <option value="multiple_choice">
              {STUDY_LABELS["multiple_choice"]}
            </option>
            <option value="writing">{STUDY_LABELS["writing"]}</option>
          </select>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Tổng số từ vựng: {vocabulary.length}
        </p>
        <Button
          onClick={startQuiz}
          disabled={
            (selectedStudyType == "multiple_choice" &&
              vocabulary.length < 4) ||
            vocabulary.length <= 0
          }
        >
          Bắt đầu học
        </Button>
        {selectedStudyType == "multiple_choice" &&
          vocabulary.length < 4 && (
            <p className="text-sm text-muted-foreground mt-2">
              Bạn cần có ít nhất 4 từ vựng để bắt đầu học trắc nghiệm.
            </p>
          )}
        {vocabulary.length <= 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Bạn cần có ít nhất 1 từ vựng để bắt đầu học.
          </p>
        )}
      </div>
    );
  }

  if (selectedStudyType == "multiple_choice") {
    return (
      <VocabularyMultiChoiceStudy
        vocabulary={studyVocabulary}
        allVocabulary={vocabulary}
        quizStarted={quizStarted}
        onRefresh={loadVocabulary}
        startQuiz={startQuiz}
        onCloseQuiz={onCloseQuiz}
      />
    );
  } else if (selectedStudyType == "writing") {
    return (
      <VocabularyWritingStudy
        vocabulary={studyVocabulary}
        quizStarted={quizStarted}
        onRefresh={loadVocabulary}
        startQuiz={startQuiz}
        onCloseQuiz={onCloseQuiz}
      />
    );
  }
}
