import { setAiKey } from "@/lib/localStorage";
import { saveAiKey } from "@/store/aiKey";
import { Middleware } from "@reduxjs/toolkit";

export const saveAiKeyMiddleware: Middleware = () => next => action => {
  const result = next(action);
  if (saveAiKey.match(action)) {
    setAiKey(action.payload ?? {provider: "OPENAI", key: "", model: "gpt-5.4-mini-2026-03-17"});
  }
  return result;
};
