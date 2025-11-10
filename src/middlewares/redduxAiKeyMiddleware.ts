import { setAiKey } from "@/lib/localStorage";
import { saveAiKey } from "@/store/aiKey";
import { Middleware } from "@reduxjs/toolkit";

export const saveAiKeyMiddleware: Middleware = () => next => action => {
  const result = next(action);
  if (saveAiKey.match(action)) {
    setAiKey(action.payload ?? {OPEN_AI_TOKEN: "", GEMINI_AI_TOKEN: ""});
  }
  return result;
};
