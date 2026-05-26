export type ProviderAIType = "OPENAI" | "GEMINI";

export type AiKeyType = {
  provider: ProviderAIType;
  key: string;
  model: string;
};

export type AIResponseType = {
  text: string | null;
  provider: ProviderAIType | "UNKNOWN";
  raw: unknown;
  token: number;
};

export type CallAiResponse = {
  data: AIResponseType | null;
  isSuccess: boolean;
  msg: string | null;
};

export type MessageType = {
  type: "success" | "error";
  text: string;
};

