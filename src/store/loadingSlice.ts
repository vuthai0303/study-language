import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    showLoading(state) {
      state.value = true;
    },
    hideLoading(state) {
      state.value = false;
    },
  },
});

export const { showLoading, hideLoading } = loadingSlice.actions;
export const loadingReducer = loadingSlice.reducer;