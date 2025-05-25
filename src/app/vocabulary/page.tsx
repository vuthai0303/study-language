"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabularyTable } from "@/components/vocabulary/vocabulary-table";
import { VocabularyStudy } from "@/components/vocabulary/vocabulary-study";
import { VocabularyType } from "@/types";
import { getVocabulary } from "@/lib/localStorage";

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyType[]>([]);
  const [activeTab, setActiveTab] = useState("list");
  const [hydrated, setHydrated] = useState(false);

  const loadVocabulary = () => {
    const data = getVocabulary();
    setVocabulary(data);
  };

  useEffect(() => {
    loadVocabulary();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Học từ vựng</h1>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">Danh sách từ vựng</TabsTrigger>
          <TabsTrigger value="study">Học từ vựng</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <VocabularyTable vocabulary={vocabulary} onRefresh={loadVocabulary} />
        </TabsContent>
        <TabsContent value="study">
          <VocabularyStudy vocabulary={vocabulary} onRefresh={loadVocabulary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}