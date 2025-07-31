"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { VocabularyType } from "@/types";
import { VocabularyForm } from "./vocabulary-form";
import { deleteVocabulary, updateVocabulary } from "@/lib/localStorage";

interface VocabularyTableProps {
  vocabulary: VocabularyType[];
  onRefresh: () => void;
}

const STATUS_LABELS: Record<VocabularyType["status"], string> = {
  to_learn: "Cần học",
  learning: "Đang học",
  mastered: "Đã thuộc",
};

export function VocabularyTable({
  vocabulary,
  onRefresh,
}: VocabularyTableProps) {
  const [openForm, setOpenForm] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] = useState<
    VocabularyType | undefined
  >(undefined);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<
    VocabularyType["status"] | null
  >(null);

  const handleAdd = () => {
    setSelectedVocabulary(undefined);
    setOpenForm(true);
  };

  const handleEdit = (vocabulary: VocabularyType) => {
    setSelectedVocabulary(vocabulary);
    setOpenForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa từ vựng này?")) {
      deleteVocabulary(id);
      onRefresh();
    }
  };

  const getWordTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      noun: "Danh từ (Noun)",
      verb: "Động từ (Verb)",
      adjective: "Tính từ (Adjective)",
      adverb: "Trạng từ (Adverb)",
      preposition: "Giới từ (Preposition)",
      conjunction: "Liên từ (Conjunction)",
      pronoun: "Đại từ (Pronoun)",
      phrase: "Cụm từ (Phrase)",
    };

    return types[type] || type;
  };

  // Split vocabulary by status, defaulting missing/invalid status to "to_learn"
  const statusLists: Record<VocabularyType["status"], VocabularyType[]> = {
    to_learn: [],
    learning: [],
    mastered: [],
  };
  vocabulary.forEach((item) => {
    const status: VocabularyType["status"] =
      item.status === "to_learn" ||
      item.status === "learning" ||
      item.status === "mastered"
        ? item.status
        : "to_learn";
    statusLists[status].push({ ...item, status });
  });

  // Native drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStatus(null);
  };

  const handleDrop = (status: VocabularyType["status"]) => {
    if (draggedId) {
      // Find the word in any status list
      const word =
        statusLists["to_learn"].find((item) => item.id === draggedId) ||
        statusLists["learning"].find((item) => item.id === draggedId) ||
        statusLists["mastered"].find((item) => item.id === draggedId);
      if (word && word.status !== status) {
        updateVocabulary({ ...word, status });
        onRefresh();
      }
    }
    setDraggedId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    status: VocabularyType["status"]
  ) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    status: VocabularyType["status"]
  ) => {
    // Only clear if leaving the current dragOverStatus
    if (dragOverStatus === status) {
      setDragOverStatus(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý từ vựng</h2>
        <Button onClick={handleAdd}>Thêm từ vựng</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          ["to_learn", "learning", "mastered"] as VocabularyType["status"][]
        ).map((status) => {
          const isActiveDrop = dragOverStatus === status;
          return (
            <div
              key={status}
              className={`border rounded-md p-2 bg-muted min-h-[200px] transition-all duration-200
                ${
                  isActiveDrop
                    ? "ring-4 ring-blue-400 border-blue-500 bg-blue-50 animate-pulse"
                    : ""
                }
              `}
              onDrop={() => handleDrop(status)}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              style={{
                boxShadow: isActiveDrop
                  ? "0 0 0 4px #60a5fa, 0 2px 8px 0 rgba(0,0,0,0.08)"
                  : undefined,
                zIndex: isActiveDrop ? 10 : undefined,
              }}
            >
              <h3 className="font-semibold text-center mb-2">
                {STATUS_LABELS[status]}
              </h3>
              <div className="flex flex-col gap-3 min-h-[120px]">
                {statusLists[status].map((item) =>
                  typeof item.id === "string" && item.id ? (
                    <Card
                      key={item.id}
                      className={`shadow-md transition-all duration-300 gap-2 py-4 ${
                        draggedId === item.id
                          ? "bg-blue-100 scale-105 shadow-2xl z-20"
                          : "bg-white"
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{item.word}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <span className="font-semibold">Loại từ: </span>
                          {getWordTypeLabel(item.type)}
                        </div>
                        <div>
                          <span className="font-semibold">Nghĩa: </span>
                          {item.meaning}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Xóa
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
      <VocabularyForm
        vocabulary={selectedVocabulary}
        onSuccess={onRefresh}
        open={openForm}
        onOpenChange={setOpenForm}
      />
    </div>
  );
}
