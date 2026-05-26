import { AiKeyType } from "@/types/ai";
import { createSlice } from "@reduxjs/toolkit";

const initialState : AiKeyType = {provider: "OPENAI", key: "", model: "gpt-5.4-mini-2026-03-17"}

const aiConfigSlice = createSlice({
  name: "AIConfig",
  initialState,
  reducers: {
    setAIConfig(state, actions) {
        return actions.payload;
    }
  },
});

export const { setAIConfig } = aiConfigSlice.actions;
export const aiConfigReducer = aiConfigSlice.reducer;
