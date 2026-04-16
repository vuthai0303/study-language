import { AIResponseType, CallAiResponse } from '@/types';
import { useAppSelector } from './reduxHook';

interface UseAIResult {
  callAI: (prompt: string, systemPrompt?: string) => Promise<any>;
  isHasKey: () => boolean
}

export const useAI = (): UseAIResult => {
  const savedAiKey = useAppSelector((state) => state.aiKey);
  const callAI = async (prompt: string, systemPrompt?: string): Promise<CallAiResponse> => {

    try {
      let response;
      if (savedAiKey.provider === 'OPENAI') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${savedAiKey.key}`,
          },
          body: JSON.stringify({
            model: savedAiKey.model || 'gpt-5.4-mini-2026-03-17',
            messages: [
              { role: 'system', content: systemPrompt ?? 'Bạn là một trợ lý có kinh nghiệm hơn 10 năm trong việc hỗ trợ người dùng học tiếng anh. Chuyên tạo ra các bài luyện tập khả năng đọc, viết tiếng anh theo nhiều chủ đề và trình độ. Đảm bảo kết quả trả về không có các ký tự kì lạ như \n\r...' },
              { role: 'user', content: prompt },
            ],
          }),
        });
      } else if (savedAiKey.provider === 'GEMINI') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${savedAiKey.model || 'gemini-pro'}:generateContent?key=${savedAiKey.key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
        });
      } else {
        return {
          isSuccess: false,
          data: null,
          msg: 'Unsupported provider',
        }
      }

      if (!response.ok) {
        return {
          isSuccess: false,
          data: null,
          msg: `API Error: ${response.statusText}`,
        }
      }

      const result = await response.json();
      return {
          isSuccess: true,
          data: getResponse(result),
          msg: null,
        }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
          isSuccess: false,
          data: null,
          msg: errorMessage,
        }
    }
  };

  const isHasKey = () => {
    return !!savedAiKey
  }

  const getResponse = (result: any): AIResponseType => {
    if (savedAiKey.provider === 'OPENAI') {
      let rs = extractOpenAIResponses(result);
      return rs?.text ? rs : extractOpenAIChatCompletions(result);
    } else if (savedAiKey.provider === 'GEMINI') {
      return extractGemini(result);
    }
    return {
      text: null,
      provider: "UNKNOWN",
      raw: result,
      token: 0,
    };
  }

  const extractOpenAIResponses = (result: any): AIResponseType => {
    const rs : AIResponseType = {
      text: null,
      provider: "OPENAI",
      raw: result,
      token: 0,
    }
    if (!result) return rs;

    if (result.output?.length > 0) {
      let output = result.output[result.output.length - 1];
      if (!output) return rs;

      let content = output.content?.length > 0 ? output.content[result.output.length - 1] : null;
      if (!content) return rs;

      rs.text = content.text?.trim() ?? null
    }

    if (result.usage) {
      rs.token = result.usage.total_tokens ?? 0
    }

    return rs;
  }

  const extractOpenAIChatCompletions = (result: any): AIResponseType => {
    const rs : AIResponseType = {
      text: null,
      provider: "OPENAI",
      raw: result,
      token: 0,
    }
    if (!result) return rs;

    if (result.choices?.length > 0) {
      let output = result.choices[result.choices.length - 1];
      if (!output) return rs;

      let content = output.message?.content ?? null;
      if (!content) return rs;

      rs.text = content.trim() ?? null
    }

    if (result.usage) {
      rs.token = result.usage.total_tokens ?? 0
    }

    return rs;
  }

  const extractGemini = (result: any): AIResponseType => {
    const rs : AIResponseType = {
      text: null,
      provider: "OPENAI",
      raw: result,
      token: 0,
    }
    if (!result) return rs;

    if (result?.choices) {
      return result?.choices[0]?.message?.content?.trim() ?? null
    }

    return rs;
  }

  return { callAI, isHasKey };
};