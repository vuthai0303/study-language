"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { VocabularyType } from "@/types";
import { VocabularyForm } from "./vocabulary-form";
import {
  addVocabulary,
  deleteVocabulary,
  updateVocabulary,
} from "@/lib/localStorage";
import { CopyIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

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

  // Export/Import state
  const [openExport, setOpenExport] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [exportJson, setExportJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const importTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Export logic
  const handleOpenExport = () => {
    setExportJson(JSON.stringify(vocabulary, null, 2));
    setOpenExport(true);
    setCopySuccess(null);
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopySuccess("Đã sao chép vào clipboard!");
      setTimeout(() => setCopySuccess(null), 1500);
    } catch {
      setCopySuccess("Không thể sao chép!");
      setTimeout(() => setCopySuccess(null), 1500);
    }
  };

  // Import logic
  const handleOpenImport = () => {
    setImportJson("");
    setImportError(null);
    setImportSuccess(null);
    setOpenImport(true);
    setTimeout(() => {
      importTextareaRef.current?.focus();
    }, 100);
  };

  const handleImportBlur = () => {
    try {
      if (!importJson.trim()) return;
      const obj = JSON.parse(importJson);
      setImportJson(JSON.stringify(obj, null, 2));
      setImportError(null);
    } catch {
      setImportError("JSON không hợp lệ!");
    }
  };

  const handleImportSync = () => {
    setImportError(null);
    setImportSuccess(null);
    let parsed: VocabularyType[];
    try {
      parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      setImportError("Định dạng JSON không hợp lệ!");
      return;
    }
    // Lọc các từ mới chưa có (so sánh word, type, meaning)
    const current = vocabulary;
    const isDuplicate = (item: VocabularyType) =>
      current.some(
        (v) =>
          v.word === item.word &&
          v.type === item.type &&
          v.meaning === item.meaning
      );
    const newWords: Omit<VocabularyType, "id" | "createdAt">[] = parsed
      .filter(
        (item) => item.word && item.type && item.meaning && !isDuplicate(item)
      )
      .map((e) => {
        return {
          word: e.word,
          type: e.type,
          meaning: e.meaning,
          status: e.status,
        };
      });
    if (newWords.length === 0) {
      setImportSuccess("Không có từ mới nào được thêm.");
      onRefresh();
      return;
    }
    try {
      newWords.forEach((item) => {
        addVocabulary(item);
      });
      setImportSuccess(`Đã thêm ${newWords.length} từ mới!`);
      onRefresh();
    } catch {
      setImportError("Có lỗi khi đồng bộ từ vựng.");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý từ vựng</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenExport}>
            Export
          </Button>
          <Button variant="outline" onClick={handleOpenImport}>
            Import
          </Button>
          <Button onClick={handleAdd}>Thêm từ vựng</Button>
        </div>
      </div>
      {/* Export Modal */}
      <Dialog open={openExport} onOpenChange={setOpenExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export danh sách từ vựng</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Textarea
              value={exportJson}
              readOnly
              className="pr-20 font-mono text-xs"
              rows={10}
              style={{ resize: "vertical" }}
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-1 right-6 bg-tranparent"
              onClick={handleCopyExport}
              aria-label="Copy JSON"
              title="Copy JSON"
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
            {copySuccess && (
              <span className="absolute end-0 left-0 text-green-600 text-xs">
                {copySuccess}
              </span>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Import Modal */}
      <Dialog open={openImport} onOpenChange={setOpenImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import danh sách từ vựng</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Textarea
              ref={importTextareaRef}
              value={importJson}
              onChange={(e) => {
                setImportJson(e.target.value);
                setImportError(null);
                setImportSuccess(null);
              }}
              onBlur={handleImportBlur}
              placeholder="Dán chuỗi JSON danh sách từ vựng tại đây..."
              rows={10}
              className="font-mono text-xs"
              style={{ resize: "vertical" }}
            />
            {importError && (
              <div className="absolute end-0 left-0 text-red-600 text-xs mt-1">
                {importError}
              </div>
            )}
            {importSuccess && (
              <div className="absolute end-0 left-0 text-green-600 text-xs mt-1">
                {importSuccess}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleImportSync} disabled={!importJson.trim()}>
              Đồng bộ
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-hidden">
        {(
          ["to_learn", "learning", "mastered"] as VocabularyType["status"][]
        ).map((status) => {
          const isActiveDrop = dragOverStatus === status;
          return (
            <div
              key={status}
              className={`border rounded-md bg-muted min-h-[200px] transition-all duration-200
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
              <div className="relative">
                <h3 className="font-semibold text-center mb-2">
                  {STATUS_LABELS[status]}
                </h3>
                <h4 className="absolute top-0 right-2 text-gray-500">
                  Tổng: {statusLists[status]?.length}
                </h4>
              </div>
              <ScrollArea className="h-[calc(100%-30px)] w-full px-3">
                {statusLists[status].map((item) =>
                  typeof item.id === "string" && item.id ? (
                    <Card
                      key={item.id}
                      className={`shadow-md transition-all duration-300 gap-2 py-4 mb-3 ${
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
                </ScrollArea>
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
