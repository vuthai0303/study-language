"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VocabularyType } from "@/types";
import { VocabularyForm } from "./vocabulary-form";
import { deleteVocabulary } from "@/lib/localStorage";

interface VocabularyTableProps {
  vocabulary: VocabularyType[];
  onRefresh: () => void;
}

export function VocabularyTable({ vocabulary, onRefresh }: VocabularyTableProps) {
  const [openForm, setOpenForm] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyType | undefined>(undefined);

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
      noun: "Danh từ",
      verb: "Động từ",
      adjective: "Tính từ",
      adverb: "Trạng từ",
      preposition: "Giới từ",
      conjunction: "Liên từ",
      pronoun: "Đại từ",
      phrase: "Cụm từ",
    };

    return types[type] || type;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách từ vựng</h2>
        <Button onClick={handleAdd}>Thêm từ vựng</Button>
      </div>

      {vocabulary.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-muted-foreground">Chưa có từ vựng nào. Hãy thêm từ vựng mới!</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Từ vựng</TableHead>
                <TableHead>Loại từ</TableHead>
                <TableHead>Nghĩa</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabulary.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.word}</TableCell>
                  <TableCell>{getWordTypeLabel(item.type)}</TableCell>
                  <TableCell>{item.meaning}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <VocabularyForm
        vocabulary={selectedVocabulary}
        onSuccess={onRefresh}
        open={openForm}
        onOpenChange={setOpenForm}
      />
    </div>
  );
}