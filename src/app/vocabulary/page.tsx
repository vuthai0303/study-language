"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabularyStudy } from "@/components/vocabulary/vocabulary-study";
import { VocabularyTable } from "@/components/vocabulary/vocabulary-table";
import { getVocabulary } from "@/lib/localStorage";
import { VocabularyType } from "@/types";
import { useEffect, useState } from "react";

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
    <div className="w-full h-fit md:h-full mx-auto py-5 md:py-10 px-2">
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="h-full overflow-hidden">
        <TabsList className="">
          <TabsTrigger value="list">Danh sách từ vựng</TabsTrigger>
          <TabsTrigger value="study">Học từ vựng</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="h-full overflow-hidden">
          <VocabularyTable vocabulary={vocabulary} onRefresh={loadVocabulary} />
        </TabsContent>
        <TabsContent value="study">
          <VocabularyStudy vocabulary={vocabulary} onRefresh={loadVocabulary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}