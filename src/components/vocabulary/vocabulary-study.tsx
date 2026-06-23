"use client";

import { Button } from "@/components/ui/button";
import { STUDY_DIRECTION_LABELS, STUDY_LABELS } from "@/consts";
import { useAI } from "@/hooks/useAI";
import { getLocalVocabulary } from "@/lib/localStorage";
import { StudyDirection, VocabularyStudyType, VocabularyType } from "@/types/vocabulary";
import { useEffect, useState } from "react";
import { VocabularyMultiChoiceStudy } from "./vocabulary-study/multi-choice";
import { VocabularySentenceStudy } from "./vocabulary-study/sentence";
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
  const shuffledVocabularies = weightedShuffleByLevel(vocabularies, 0.1);

  // Combine and shuffle final selection
  return [...shuffledVocabularies.slice(0, 7), ...shuffledVocabularies.slice(-3)];
}

/**
 * Select 50 words for practice based on weighted shuffle by level (the lower level, the higher the chance of being selected at the top of the list):
 * - If total vocabulary > 50, select 40 first words in list, 10 end words in list
 * - If total vocabulary <= 50, random list and select all
 */
function selectSentenceVocabulary(vocabularies: VocabularyType[]): VocabularyType[] {
  if (vocabularies.length <= 50) {
    return [...vocabularies].sort(() => 0.5 - Math.random());
  }
  const shuffledVocabularies = weightedShuffleByLevel(vocabularies, 0.1);
  return [...shuffledVocabularies.slice(0, 40), ...shuffledVocabularies.slice(-10)];
}

// Study modes that support direction selection
const DIRECTION_SUPPORTED_MODES: VocabularyStudyType[] = ["multiple_choice", "sentence"];

export function VocabularyStudy() {
  const { isHasKey } = useAI();
  const [vocabulary, setVocabulary] = useState<VocabularyType[]>([]);
  const [studyVocabulary, setStudyVocabulary] = useState<VocabularyType[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedStudyType, setSelectedStudyType] =
    useState<VocabularyStudyType>("multiple_choice");
  const [selectedDirection, setSelectedDirection] = useState<StudyDirection>("en_to_vi");

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

  const showDirectionDropdown = DIRECTION_SUPPORTED_MODES.includes(selectedStudyType);

  const startQuiz = () => {
    // Reload fresh data before starting
    const freshData = getLocalVocabulary();

    if (selectedStudyType === "multiple_choice" && freshData.length < 4) {
      alert("Bạn cần có ít nhất 4 từ vựng để bắt đầu học trắc nghiệm!");
      return;
    }

    if (selectedStudyType === "sentence") {
      if (!isHasKey()) {
        alert("Bạn cần cấu hình AI (API Key) để sử dụng chế độ Câu văn!");
        return;
      }
      const selectedVocabulary = selectSentenceVocabulary(freshData);
      setStudyVocabulary(selectedVocabulary);
      setQuizStarted(true);
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

  // ── Start screen ───────────────────────────────────────────────────────────
  if (!quizStarted) {
    const hasSentenceKey = isHasKey();
    const isStartDisabled =
      (selectedStudyType === "multiple_choice" && vocabulary.length < 4) ||
      vocabulary.length <= 0 ||
      (selectedStudyType === "sentence" && !hasSentenceKey);

    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Học từ vựng</h2>
        <p className="text-center mb-6">
          Hệ thống sẽ tự động chọn từ vựng dựa bằng cách random theo mức độ thành thạo (level) của bạn.
        </p>

        {/* Study mode selector */}
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
          <label htmlFor="study-type-select" className="font-medium">
            Chọn chế độ học:
          </label>
          <select
            id="study-type-select"
            value={selectedStudyType}
            onChange={(e) => setSelectedStudyType(e.target.value as VocabularyStudyType)}
            className="border rounded px-2 py-1 bg-background"
          >
            <option value="multiple_choice">{STUDY_LABELS["multiple_choice"]}</option>
            <option value="writing">{STUDY_LABELS["writing"]}</option>
            <option value="sentence">{STUDY_LABELS["sentence"]}</option>
          </select>
        </div>

        {/* Direction selector — only for multi-choice and sentence */}
        {showDirectionDropdown && (
          <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
            <label htmlFor="study-direction-select" className="font-medium">
              Chiều luyện tập:
            </label>
            <select
              id="study-direction-select"
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value as StudyDirection)}
              className="border rounded px-2 py-1 bg-background"
            >
              <option value="en_to_vi">{STUDY_DIRECTION_LABELS["en_to_vi"]}</option>
              <option value="vi_to_en">{STUDY_DIRECTION_LABELS["vi_to_en"]}</option>
            </select>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Tổng số từ vựng: {vocabulary.length}
        </p>

        <Button onClick={startQuiz} disabled={isStartDisabled}>
          Bắt đầu học
        </Button>

        {/* Hint messages */}
        {selectedStudyType === "multiple_choice" && vocabulary.length < 4 && (
          <p className="text-sm text-muted-foreground mt-2">
            Bạn cần có ít nhất 4 từ vựng để bắt đầu học trắc nghiệm.
          </p>
        )}
        {vocabulary.length <= 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Bạn cần có ít nhất 1 từ vựng để bắt đầu học.
          </p>
        )}
        {selectedStudyType === "sentence" && !hasSentenceKey && (
          <p className="text-sm text-muted-foreground mt-2">
            Chế độ Câu văn yêu cầu cấu hình AI. Vui lòng thiết lập API Key trong phần Cài đặt.
          </p>
        )}
      </div>
    );
  }

  // ── Study screens ──────────────────────────────────────────────────────────
  if (selectedStudyType === "multiple_choice") {
    return (
      <VocabularyMultiChoiceStudy
        vocabulary={studyVocabulary}
        allVocabulary={vocabulary}
        direction={selectedDirection}
        quizStarted={quizStarted}
        onRefresh={loadVocabulary}
        startQuiz={startQuiz}
        onCloseQuiz={onCloseQuiz}
      />
    );
  }

  if (selectedStudyType === "writing") {
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

  if (selectedStudyType === "sentence") {
    return (
      <VocabularySentenceStudy
        vocabulary={studyVocabulary}
        direction={selectedDirection}
        quizStarted={quizStarted}
        onRefresh={loadVocabulary}
        startQuiz={startQuiz}
        onCloseQuiz={onCloseQuiz}
      />
    );
  }
}
