export type ListeningLevel = "Cơ bản" | "Trung cấp" | "Chuyên nghiệp";

export type ListeningSegment = {
  id: number;
  title: string;
  subtitle: string;
  audioText: string;
  transcript: string;
};

export type ListeningQuestion = {
  id: string;
  prompt: string;
  audioText: string;
  transcript: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  segmentId?: number;
};

export type ListeningPracticeType = {
  title: string;
  topic: string;
  level: ListeningLevel;
  fullTranscript?: string;
  segments?: ListeningSegment[];
  questions: ListeningQuestion[];
};
