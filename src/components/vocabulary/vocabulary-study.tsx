"use client";

import { Button } from "@/components/ui/button";
import { STUDY_LABELS } from "@/consts";
import { getLocalVocabulary } from "@/lib/localStorage";
import { VocabularyStudyType, VocabularyType } from "@/types";
import { useEffect, useState } from "react";
import { VocabularyMultiChoiceStudy } from "./vocabulary-study/multi-choice";
import { VocabularyWritingStudy } from "./vocabulary-study/writing";

/**
 * Select 10 words for practice based on level:
 * - 7 words with the lowest level (prioritize from the bottom, random if same level)
 * - 3 words with the highest level (prioritize from the top, random if same level)
 * - If total vocabulary < 10, select all
 */
function selectStudyVocabulary(vocabulary: VocabularyType[]): VocabularyType[] {
  if (vocabulary.length <= 10) {
    return [...vocabulary].sort(() => 0.5 - Math.random());
  }

  // Sort by level ascending, shuffle within same level
  const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
  const sortedAsc = [...shuffled].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  const sortedDesc = [...shuffled].sort((a, b) => (b.level ?? 0) - (a.level ?? 0));

  // Pick 7 lowest-level words
  const lowLevelWords = sortedAsc.slice(0, 7);
  const lowLevelIds = new Set(lowLevelWords.map((w) => w.id));

  // Pick 3 highest-level words (not already in low-level set)
  const highLevelWords: VocabularyType[] = [];
  for (const word of sortedDesc) {
    if (!lowLevelIds.has(word.id)) {
      highLevelWords.push(word);
      if (highLevelWords.length >= 3) break;
    }
  }

  // Combine and shuffle the final set
  const selected = [...lowLevelWords, ...highLevelWords];
  return selected.sort(() => 0.5 - Math.random());
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
