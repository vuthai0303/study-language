import { configureStore } from "@reduxjs/toolkit";
import { loadingReducer } from "./loadingSlice";
import { aiConfigReducer } from "./aiConfigSlice";

export const store = configureStore({
  reducer: {
    isLoading: loadingReducer,
    AIConfig: aiConfigReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;