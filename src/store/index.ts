import { configureStore } from "@reduxjs/toolkit";
import { loadingReducer } from "./loadingSlice";
import { aiKeyReducer } from "./aiKey";
import { saveAiKeyMiddleware } from "@/middlewares/redduxAiKeyMiddleware";

export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saveAiKeyMiddleware),
  reducer: {
    isLoading: loadingReducer,
    aiKey: aiKeyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;