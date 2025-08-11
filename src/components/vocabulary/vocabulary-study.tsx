"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VocabularyStudyType, VocabularyType } from "@/types";
import { STATUS_LABELS, STUDY_LABELS } from "@/consts";
import { VocabularyMultiChoiceStudy } from "./vocabulary-study/multi-choice";
import { VocabularyWritingStudy } from "./vocabulary-study/writing";

interface VocabularyStudyProps {
  vocabulary: VocabularyType[];
  onRefresh: () => void;
}

export function VocabularyStudy({
  vocabulary,
  onRefresh,
}: VocabularyStudyProps) {
  const [studyVocabulary, setStudyVocabulary] = useState<VocabularyType[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<VocabularyType["status"]>("to_learn");
  const [selectedStudyType, setSelectedStudyType] =
    useState<VocabularyStudyType>("multiple_choice");

  // Filter vocabulary by selected status
  const filteredVocabulary = vocabulary.filter(
    (v) => v.status === selectedStatus
  );

  const startQuiz = () => {
    if (
      selectedStudyType == "multiple_choice" &&
      filteredVocabulary.length < 4
    ) {
      alert("Bạn cần có ít nhất 4 từ vựng để bắt đầu học!");
      return;
    }

    const shuffled = [...filteredVocabulary].sort(() => 0.5 - Math.random());
    const selectedVocabulary = shuffled.slice(0, Math.min(10, shuffled.length));
    setStudyVocabulary(selectedVocabulary);

    setQuizStarted(true);
  };

  const onCloseQuiz = () => {
    setStudyVocabulary([]);
    setQuizStarted(false);
  };

  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Học từ vựng</h2>
        <p className="text-center mb-6">
          Bắt đầu bài kiểm tra trắc nghiệm để kiểm tra kiến thức từ vựng của
          bạn.
        </p>
        <div className="mb-4 flex flex-row gap-2">
          <label htmlFor="status-select" className="mr-2 font-medium">
            Chọn nhóm từ vựng:
          </label>
          <select
            id="status-select"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as VocabularyType["status"])
            }
            className="border rounded px-2 py-1"
          >
            <option value="to_learn">{STATUS_LABELS["to_learn"]}</option>
            <option value="learning">{STATUS_LABELS["learning"]}</option>
            <option value="mastered">{STATUS_LABELS["mastered"]}</option>
          </select>
          <select
            id="status-select"
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
        <Button
          onClick={startQuiz}
          disabled={
            (selectedStudyType == "multiple_choice" &&
              filteredVocabulary.length < 4) ||
            filteredVocabulary.length <= 0
          }
        >
          Bắt đầu học
        </Button>
        {selectedStudyType == "multiple_choice" &&
          filteredVocabulary.length < 4 && (
            <p className="text-sm text-muted-foreground mt-2">
              Bạn cần có ít nhất 4 từ vựng để bắt đầu học.
            </p>
          )}
        {filteredVocabulary.length <= 0 && (
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
        selectedStatus={selectedStatus}
        quizStarted={quizStarted}
        onRefresh={onRefresh}
        startQuiz={startQuiz}
        onCloseQuiz={onCloseQuiz}
      />
    );
  } else if (selectedStudyType == "writing") {
    return (
      <VocabularyWritingStudy
        vocabulary={studyVocabulary}
        selectedStatus={selectedStatus}
        quizStarted={quizStarted}
        onRefresh={onRefresh}
        startQuiz={startQuiz}
        onCloseQuiz={onCloseQuiz}
      />
    );
  }
}
