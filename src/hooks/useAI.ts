import { CallAiResponse } from '@/types';

interface UseAIResult {
  callAI: (prompt: string, provider: 'openai' | 'gemini', model?: string) => Promise<any>;
}

export const useAI = (apiKey: string): UseAIResult => {
  const callAI = async (prompt: string, provider: 'openai' | 'gemini', model?: string, systemPrompt?: string): Promise<CallAiResponse> => {

    try {
      let response;
      if (provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || 'gpt-5.4-mini-2026-03-17',
            messages: [
              { role: 'system', content: systemPrompt ?? 'Bạn là một trợ lý có kinh nghiệm hơn 10 năm trong việc hỗ trợ người dùng học tiếng anh. Chuyên tạo ra các bài luyện tập khả năng đọc, viết tiếng anh theo nhiều chủ đề và trình độ. Đảm bảo kết quả trả về không có các ký tự kì lạ như \n\r...' },
              { role: 'user', content: prompt },
            ],
          }),
        });
      } else if (provider === 'gemini') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
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

  const getResponse = (result: any) => {
    if (result?.output && result?.output?.length > 0) {
      return result?.output[result?.output?.length - 1]?.content[0]?.text?.trim() ?? null
    } else if (result?.choices) {
      return result?.choices[0]?.message?.content?.trim() ?? null
    }
    return null
  }

  return { callAI };
};