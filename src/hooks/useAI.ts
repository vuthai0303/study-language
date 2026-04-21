import { AIResponseType, CallAiResponse } from '@/types';
import { getLocalStoreAiKey } from '@/lib/localStorage';
import { useAppDispatch, useAppSelector } from './reduxHook';
import { setLoading } from '@/store/loadingSlice';
import { useEffect } from 'react';
import { setAIConfig } from '@/store/aiConfigSlice';

interface UseAIResult {
  callAI: (prompt: string, systemPrompt?: string) => Promise<CallAiResponse>;
  isHasKey: () => boolean
}

export const useAI = (): UseAIResult => {
  const dispatch = useAppDispatch();
  const AIConfig = useAppSelector((state) => state.AIConfig);
  
  useEffect(() => {
    const AIConfigLocal = getLocalStoreAiKey()
    if (AIConfigLocal.key && (AIConfigLocal.key != AIConfig.key)) {
      dispatch(setAIConfig(AIConfigLocal))
    }
  }, [])

  const callAI = async (prompt: string, systemPrompt?: string): Promise<CallAiResponse> => {

    if (!AIConfig || !isHasKey()) {
      return {
          isSuccess: false,
          data: null,
          msg: "Vui lòng config AI để sử dụng!",
        }
    }

    try {
      dispatch(setLoading(true));
      let response;
      if (AIConfig.provider === 'OPENAI') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AIConfig.key}`,
          },
          body: JSON.stringify({
            model: AIConfig.model || 'gpt-5.4-mini-2026-03-17',
            messages: [
              { role: 'system', content: systemPrompt ?? 'Bạn là một trợ lý có kinh nghiệm hơn 10 năm trong việc hỗ trợ người dùng học tiếng anh. Chuyên tạo ra các bài luyện tập khả năng đọc, viết tiếng anh theo nhiều chủ đề và trình độ. Đảm bảo kết quả trả về không có các ký tự kì lạ như \n\r...' },
              { role: 'user', content: prompt },
            ],
          }),
        });
      } else if (AIConfig.provider === 'GEMINI') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AIConfig.model || 'gemini-flash-latest'}:generateContent?key=${AIConfig.key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: { "text": systemPrompt ?? 'Bạn là một trợ lý có kinh nghiệm hơn 10 năm trong việc hỗ trợ người dùng học tiếng anh. Chuyên tạo ra các bài luyện tập khả năng đọc, viết tiếng anh theo nhiều chủ đề và trình độ. Đảm bảo kết quả trả về không có các ký tự kì lạ như \n\r...' }
            },
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
      const data = getResponse(result);
      if (!data || !data.text) {
        return {
          isSuccess: false,
          data: data,
          msg: "An error occurred during the process; please contact the administrator and try again later!",
        }
      }
      return {
          isSuccess: true,
          data: data,
          msg: null,
        }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '' + err;
      return {
          isSuccess: false,
          data: null,
          msg: errorMessage,
        }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isHasKey = () => {
    return !!(AIConfig && AIConfig.provider && AIConfig.key && AIConfig.model)
  }

  const getResponse = (result: any): AIResponseType => {
    if (!AIConfig) throw "Please setting AI Config!"
    if (AIConfig.provider === 'OPENAI') {
      const rs = extractOpenAIResponses(result);
      return rs?.text ? rs : extractOpenAIChatCompletions(result);
    } else if (AIConfig.provider === 'GEMINI') {
      return extractGemini(result);
    } else {
      throw "Not support " + AIConfig.provider + ", please using Gemini or OpenAI!"
    }
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
      const output = result.output[result.output.length - 1];
      if (!output) return rs;

      const content = output.content?.length > 0 ? output.content[result.output.length - 1] : null;
      if (!content) return rs;

      rs.text = content.text?.replaceAll("```", "").replaceAll("json", "").replaceAll("\n", "").trim() ?? null
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
      const output = result.choices[result.choices.length - 1];
      if (!output) return rs;

      const content = output.message?.content ?? null;
      if (!content) return rs;

      rs.text = content.replaceAll("```", "").replaceAll("json", "").replaceAll("\n", "").trim() ?? null
    }

    if (result.usage) {
      rs.token = result.usage.total_tokens ?? 0
    }

    return rs;
  }

  const extractGemini = (result: any): AIResponseType => {
    const rs : AIResponseType = {
      text: null,
      provider: "GEMINI",
      raw: result,
      token: 0,
    }
    if (!result) return rs;

    if (result?.candidates && result.candidates.length > 0) {
      const parts = result.candidates[result.candidates.length - 1]?.content?.parts;
      if (!parts || parts.length === 0) return rs;
      rs.text = parts[parts.length - 1]?.text?.replaceAll("```", "").replaceAll("json", "").replaceAll("\n", "").trim() ?? null
    }

    if (result?.usageMetadata) {
      rs.token = result.usageMetadata.totalTokenCount ?? 0
    }

    return rs;
  }

  return { callAI, isHasKey };
};