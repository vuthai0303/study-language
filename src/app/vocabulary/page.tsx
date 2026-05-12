"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabularyStudy } from "@/components/vocabulary/vocabulary-study";
import { VocabularyTable } from "@/components/vocabulary/vocabulary-table";
import { useState } from "react";

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="w-full h-fit md:h-full mx-auto py-5 md:py-10 px-2 md:px-5">
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="h-full overflow-hidden">
        <TabsList className="">
          <TabsTrigger value="list">Danh sách từ vựng</TabsTrigger>
          <TabsTrigger value="study">Học từ vựng</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="h-full overflow-hidden">
          <VocabularyTable />
        </TabsContent>
        <TabsContent value="study">
          <VocabularyStudy />
        </TabsContent>
      </Tabs>
    </div>
  );
}