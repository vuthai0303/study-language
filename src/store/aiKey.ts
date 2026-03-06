import { getAiKey } from "@/lib/localStorage";
import { AiKeyType } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const aiKey = getAiKey();

const initialState: AiKeyType = aiKey;

const aiKeySlice = createSlice({
  name: "aiKey",
  initialState,
  reducers: {
    saveAiKey(state, value : PayloadAction<AiKeyType>) {
      return value.payload;
    },
  },
});

export const { saveAiKey } = aiKeySlice.actions;
export const aiKeyReducer = aiKeySlice.reducer;