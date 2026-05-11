"use client";

import { ReadingPractice } from "@/components/reading/reading-practice";
import { TopicSelector } from "@/components/reading/topic-selector";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_READING_TOPIC } from "@/consts";
import { useAI } from "@/hooks/useAI";
import { getLocalHistoryParagraph, getLocalVocabulary, saveLocalHistoryParagraph } from "@/lib/localStorage";
import { CallAiResponse, ReadingPracticeType, VocabularyType } from "@/types";
import { useEffect, useState } from "react";

export default function ReadingPage() {
  const { callAI, isHasKey } = useAI();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>("1");
  const [level, setLevel] = useState<string>("Trung cấp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPractice, setGeneratedPractice] =
    useState<ReadingPracticeType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [historyParagraph, setHistoryParagraph] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vocabularies, setVocabularies] = useState<VocabularyType[]>([]);

  useEffect(() => {
    setHistoryParagraph(getLocalHistoryParagraph(false));
    setVocabularies(getLocalVocabulary());
  }, []);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);
  };

  const handleGeneratePractice = async () => {
    console.log("Generating practice for topic:", selectedTopicId, "level:", level);
    setErrorMessage(null);
    setGeneratedPractice(null);
    setShowPractice(false);

    if (!isHasKey()) {
      setErrorMessage("Vui lòng cài đặt OpenAI API key trong mục Cài đặt.");
      return;
    }

    if (!selectedTopicId) {
      setErrorMessage("Vui lòng chọn một chủ đề.");
      return;
    }

    setIsGenerating(true);

    try {
      const topics = DEFAULT_READING_TOPIC;
      const selectedTopic = topics.find((t) => t.id === selectedTopicId);

      if (!selectedTopic) {
        setErrorMessage("Chủ đề không hợp lệ.");
        throw new Error("Topic not found");
      }

      // Xác định hướng dẫn theo trình độ
      let levelInstruction = "";
      if (level === "Cơ bản") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng dễ nhớ, phổ thông và cấu trúc câu cơ bản, phù hợp cho người có trình độ tiếng anh căn bản. Tương ứng với trình độ Toeic dưới 400, Ielts dưới 4.";
      } else if (level === "Trung cấp") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng phổ biến, cấu trúc câu từ và độ khó câu hỏi ở mức trung cấp, phù hợp cho người có trình độ tiếng anh trung cấp. Tương ứng với trình độ Toeic từ 400 đến 700, Ielts từ 4 đến 7.";
      } else if (level === "Chuyên nghiệp") {
        levelInstruction =
          "Đoạn văn nên sử dụng từ vựng chuyên nghiệp, chính xác với tình huống và cấu trúc câu nâng cao, độ khó câu hỏi ở mức nâng cao, thể hiện sự tự nhiên và chuyên nghiệp, phù hợp cho người học trình độ tiếng anh chuyên nghiệp. Tương ứng với trình độ Toeic trên 700, Ielts trên 7.";
      } else {
        levelInstruction = "";
      }

      let topic = "";
      if (+selectedTopicId == 0) {
        topic = `Nội dung sẽ là 1 đoạn trích (khoảng 600 từ) hay, tâm đắc, phổ biến bằng tiếng anh trong các cuốn sách / tiểu thuyết sau: 
        Không Gia Đình - Hector Malot, Ông Già Và Biển Cả - Ernest Hemingway, Âm Thanh Và Cuồng Nộ - William Faulkner, Thép Đã Tôi Thế Đấy - Nikolai Ostrovsky,
        Nhà Giả Kim - Paulo Coelho, Lược Sử Thời Gian - Stephen Hawking, Cuốn Theo Chiều Gió - Margaret Munnerlyn Mitchell, Những Người Khốn Khổ - Victor Hugo,
        Hai Số Phận - Jeffrey Archer, Đồi Gió Hú - Ellis Bell, Chiến Tranh Và Hòa Bình - Lev Nikolayevich Tolstoy, Sông Đông êm đềm - Mikhail Aleksandrovich Sholokhov,
        Trăm Năm Cô Đơn - Gabriel Garcia Marquez, Từ Thăm Thẳm Lãng Quên - Patrick Modiano, Nếu Em Không Phải Một Giấc Mơ - Marc Levy.
        Hãy nhớ có thêm 1 dòng bằng tiếng anh mô tả đoạn văn trên được trích từ sách / tiểu thuyết nào?, trang bao nhiêu? vào cuối câu.
        Và khoảng 5 câu hỏi trắc nghiệm để người dùng dựa vào thông tin đã đọc từ đoạn trích để trả lời.`;
      } else if (+selectedTopicId == 7) {
        topic = `Nội dung sẽ gồm 1 đoạn văn khoảng 500-600 từ được tạo từ các từ vựng sau \n ${JSON.stringify(vocabularies.map(item => ({ word: item.word, type: item.type, meaning: item.meaning })))} \n
                Đảm bảo sử dụng ít nhất 10 từ trong danh sách từ vựng trên. Đồng thời đoạn văn phải liền mạch, có ý nghĩa và có thể giúp đỡ người dùng luyện khả năng dịch và ghi nhớ từ vựng.
                Cùng với đó là khoảng 5 câu hỏi trắc nghiệm để người dùng dựa vào thông tin đã đọc từ đoạn văn trên để trả lời. Đảm bảo câu hỏi phải có ý nghĩa, phù hợp với đoạn văn.
                `;
      } else if (+selectedTopicId == 8) {
        topic = `Nội dung sẽ gồm 1 đoạn văn khoảng 500-600 về chủ đề công nghệ trong lĩnh vực lập trình full-stacks.
                Đoạn văn sẽ tập trung vào 1 chủ đề mới hoặc nổi tiếng trong giới lập trình và có khả năng giúp người dùng cải thiện tiếng anh cùng với cải thiện kỹ năng chuyên môn của mình để phát triển hướng tới vai trò Technical Leader/Architect.
                Ví dụ: 
                - Giới thiệu để hiểu rõ hơn về SOLID | Clean Architecture | Domain Driven Design,... hoặc kiến trúc hệ thống như monolith | microservice | event-driven,...
                - Giới thiệu về Kubernetes | Message Queue | kafka | Docker | CI/CD | gRPC | GraphQL,... (Bài giới thiệu nên trả lời được cho các câu hỏi sau: đó là gì?, vai trò của nó như thế nào? ưu và nhược điểm là gì? có thể ứng dụng với các hệ thống như thế nào?,...)
                - Các bài toán gặp phải khi xây dựng hệ thống chịu tải cao | realtime streaming | ngân hàng | security,... (Bài viết nên trả lời được cho các câu hỏi sau: vấn đề gặp phải là gì?, cách giải quyết như thế nào cho hiệu quả,...)
                - Các lỗi security thường gặp, nguyên nhân và cách phòng chống,...
                - Các design pattern phổ biến trong lập trình và ứng dụng thực tế,...
                - Cách đánh giá performance của một hệ thống, tối ưu hiệu năng của hệ thống,...
                - ...
                Cùng với đó là khoảng 5 câu hỏi trắc nghiệm để người dùng dựa vào thông tin đã đọc từ đoạn văn trên để trả lời. Đảm bảo câu hỏi phải có ý nghĩa, phù hợp với đoạn văn.'`;
      } else {
        topic = `Nội dung sẽ gồm 1 đoạn văn khoảng 600 từ về chủ đề '${selectedTopic.name} và khoảng 5 câu hỏi trắc nghiệm để người dùng dựa vào thông tin đã đọc từ đoạn văn để trả lời.'`;
      }

      const prompt = `Hãy giúp tôi tạo ra 1 bài luyện tập khả năng đọc trong tiếng anh (tham khảo các bài thi về reading trong kì thi Toeic, Ielts,...). 
                      '${topic}'
                      \n ${levelInstruction}
                      Đảm bảo trả về kết quả chính xác dưới dạng JSON đúng với định dạng bên dưới:
                      {
                        paragraph: "abc" // Đây là đoạn văn,
                        questions: [{
                            label: "Câu hỏi" // Đây là câu hỏi bằng tiếng anh
                            answers: ["A. xyz", "B. abc", "C. xzt", "D. aqq"] // Danh sách kết quả trắc nghiệm, gồm 4 đáp án A, B, C, D
                            trueAnsswer: 1 // index tương ứng với kết quả đúng
                            explain: "Giải thích" // Giải thích ngắn gọn, dễ hiểu cho người dùng hiểu về kết quả đúng. Giải thích bằng tiếng việt.
                        }] // Danh sách gồm 5 câu hỏi bằng tiếng anh tương ứng với đoạn văn
                      }
                      \n Bên cạnh đó dưới đây là các các bài luyện tập khả năng đọc tiếng anh mà trước đó bạn đã giúp tôi tạo ra. 
                      \n Hãy đảm bảo rằng các bài luyện tập khả năng đọc tiếng anh mới được tạo ra sẽ khác 70% so với các đoạn văn trước đó.
                      \n ${historyParagraph.join("\n")}
                      `;

      const response: CallAiResponse = await callAI(prompt);

      if (!response.isSuccess || !response.data) {
        setErrorMessage("Có lỗi xảy ra khi tạo bài tập. Vui lòng thử lại!");
        return
      }

      const message = response.data.text ?? "";

      const practice = message
        ? JSON.parse(message)
        : {
            paragraph: "",
            questions: [],
          };

      setHistoryParagraph(
        saveLocalHistoryParagraph(
          false,
          [practice?.paragraph ?? "", ...historyParagraph].splice(0, 10)
        )
      );

      if (practice) {
        setGeneratedPractice(practice);
        setShowPractice(true);
      } else {
        setErrorMessage(
          "Không nhận được nội dung hợp lệ từ OpenAI. Vui lòng thử lại."
        );
        throw new Error("Empty response from OpenAI");
      }
    } catch (error) {
      console.error("Error generating paragraph:", error);
      if (!errorMessage) {
        setErrorMessage("Có lỗi xảy ra khi tạo bài tập. Vui lòng thử lại!");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPractice = () => {
    cancelPractice();
    handleGeneratePractice();
  };

  const cancelPractice = () => {
    setGeneratedPractice(null);
    setErrorMessage(null);
    setShowPractice(false);
    setIsCompleted(false);
  };

  const checkResult = (value : boolean) => {
    if (value === false && isCompleted === true) {
      // reset khi chuyển từ trạng thái completed sang chưa completed
      resetPractice();
    }
    setIsCompleted(value);
  }

  return (
    <div className="w-full h-full overflow-auto mx-auto px-2 md:px-10 py-6 flex flex-col gap-3">
      <h1 className="text-3xl font-bold">Luyện đọc Tiếng Anh</h1>
      <Card className="min-w-[380px] gap-3 py-3">
        <CardContent className="space-y-3">
          <div>
            <p className="text-muted-foreground mb-2">
              Chọn một chủ đề và trình độ, sau đó nhấn &ldquo;Tạo bài tập&rdquo;
              để AI tạo bài tập.
            </p>
            <TopicSelector
              onTopicSelect={handleTopicSelect}
              onGeneratePractice={handleGeneratePractice}
              selectedTopicId={selectedTopicId}
              level={level}
              onLevelChange={setLevel}
              isGenerating={isGenerating}
              showPractice={showPractice}
              isCompleted={isCompleted}
              cancelPractice={cancelPractice}
              checkResult={checkResult}
            />
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2">Đang tạo bài tập...</p>
            </div>
          )}

          {errorMessage && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              <span className="font-medium">Lỗi:</span> {errorMessage}
            </div>
          )}

          {((!isGenerating &&
            !generatedPractice &&
            !errorMessage &&
            !selectedTopicId) ||
            !isHasKey()
          ) && (
              <p className="text-muted-foreground text-center py-4">
                Vui lòng chọn chủ đề và cài đặt API Key (nếu chưa có) để bắt
                đầu.
              </p>
            )}
        </CardContent>
      </Card>
      {showPractice && generatedPractice && (
        <ReadingPractice
          practice={generatedPractice}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}
