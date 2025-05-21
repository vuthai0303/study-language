"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TopicSelector } from "@/components/writing/topic-selector";
import { TranslationPractice } from "@/components/writing/translation-practice";
import { getTopics } from "@/lib/localStorage";

export default function WritingPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paragraph, setParagraph] = useState<string | null>(null);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  const handleGenerateParagraph = async () => {
    if (!selectedTopicId) return;

    setIsGenerating(true);

    try {
      // Get the topic name
      const topics = getTopics();
      const selectedTopic = topics.find((t) => t.id === selectedTopicId);

      if (!selectedTopic) {
        throw new Error("Topic not found");
      }

      // In a real application, this would call the OpenAI API
      // For this demo, we'll generate a sample paragraph based on the topic
      
      // Sample paragraphs for each topic
      const sampleParagraphs: Record<string, string> = {
        "1": "Du lịch là một hoạt động giúp con người khám phá thế giới và mở rộng tầm nhìn. Khi đi du lịch, chúng ta có cơ hội trải nghiệm những nền văn hóa khác nhau, thưởng thức ẩm thực đặc sắc và chiêm ngưỡng những cảnh đẹp tự nhiên. Việt Nam là một điểm đến du lịch hấp dẫn với nhiều danh lam thắng cảnh nổi tiếng như Vịnh Hạ Long, Phố cổ Hội An và Hang Sơn Đoòng. Du lịch không chỉ mang lại niềm vui và kỷ niệm đẹp mà còn giúp chúng ta học hỏi và phát triển bản thân.",
        "2": "Công nghệ đang phát triển với tốc độ chóng mặt và thay đổi cuộc sống của chúng ta theo nhiều cách. Trí tuệ nhân tạo (AI) là một trong những lĩnh vực công nghệ đang phát triển nhanh nhất, với khả năng tự học và thích nghi. Các thiết bị thông minh như điện thoại, máy tính và thiết bị gia dụng ngày càng trở nên phổ biến trong cuộc sống hàng ngày. Internet vạn vật (IoT) kết nối mọi thứ và tạo ra một hệ sinh thái thông minh. Tuy nhiên, sự phát triển của công nghệ cũng đặt ra nhiều thách thức về bảo mật và quyền riêng tư.",
        "3": "Giáo dục đóng vai trò quan trọng trong việc phát triển con người và xã hội. Một nền giáo dục tốt không chỉ cung cấp kiến thức mà còn dạy cách tư duy và giải quyết vấn đề. Hiện nay, phương pháp giáo dục đang thay đổi từ học thuộc lòng sang học tập trải nghiệm và phát triển kỹ năng. Công nghệ cũng đang được ứng dụng rộng rãi trong giáo dục, giúp việc học trở nên thú vị và hiệu quả hơn. Tuy nhiên, không phải ai cũng có cơ hội tiếp cận với nền giáo dục chất lượng, đặc biệt là ở các vùng nông thôn và các nước đang phát triển.",
        "4": "Sức khỏe là tài sản quý giá nhất của con người. Một lối sống lành mạnh bao gồm chế độ ăn uống cân bằng, tập thể dục đều đặn và nghỉ ngơi đầy đủ. Stress và lo âu là những vấn đề sức khỏe tâm thần phổ biến trong xã hội hiện đại. Thiền và yoga là những phương pháp hiệu quả để giảm stress và cải thiện sức khỏe tinh thần. Việc khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề sức khỏe và điều trị kịp thời. Chăm sóc sức khỏe không chỉ là trách nhiệm của cá nhân mà còn là của cả cộng đồng và xã hội.",
        "5": "Thể thao không chỉ giúp cải thiện sức khỏe thể chất mà còn rèn luyện tinh thần và ý chí. Bóng đá là môn thể thao phổ biến nhất thế giới, thu hút hàng tỷ người hâm mộ. Các sự kiện thể thao lớn như Olympic và World Cup mang lại cảm giác đoàn kết và tự hào dân tộc. Thể thao cũng dạy chúng ta những bài học quý giá về tinh thần đồng đội, sự kiên trì và cách đối mặt với thất bại. Ngày nay, nhiều người tham gia các hoạt động thể thao không chỉ để thi đấu mà còn để giải trí và kết nối với người khác.",
      };
      
      // Get the sample paragraph for the selected topic or use a default one
      const generatedParagraph = sampleParagraphs[selectedTopicId] || 
        "Đây là một đoạn văn mẫu được tạo ra cho chủ đề này. Trong một ứng dụng thực tế, đoạn văn này sẽ được tạo ra bởi OpenAI API dựa trên chủ đề đã chọn. Đoạn văn sẽ bao gồm nhiều câu với độ dài và độ phức tạp khác nhau để người dùng có thể thực hành dịch từ tiếng Việt sang tiếng Anh.";
      
      // In a real application, you would use OpenAI API like this:
      /*
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates Vietnamese paragraphs about specific topics for language learning purposes."
            },
            {
              role: "user",
              content: `Generate a paragraph in Vietnamese about the topic: ${selectedTopic.name}. The paragraph should be around 5-6 sentences, with varying complexity, suitable for a language learning exercise where students will translate it to English.`
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
          }
        }
      );
      
      const generatedParagraph = response.data.choices[0].message.content;
      */
      
      setParagraph(generatedParagraph);
    } catch (error) {
      console.error("Error generating paragraph:", error);
      alert("Có lỗi xảy ra khi tạo đoạn văn. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setParagraph(null);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Học viết</h1>
      
      <Card>
        <CardContent className="pt-6">
          {!paragraph ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Chọn một chủ đề và nhấn &ldquo;Tạo đoạn văn&rdquo; để bắt đầu bài tập dịch từ tiếng Việt sang tiếng Anh.
              </p>
              
              <TopicSelector
                onTopicSelect={handleTopicSelect}
                onGenerateParagraph={handleGenerateParagraph}
                isGenerating={isGenerating}
                selectedTopicId={selectedTopicId}
              />
            </div>
          ) : (
            <TranslationPractice paragraph={paragraph} onReset={handleReset} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}