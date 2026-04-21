import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading(state, actions) {
      state.value = actions.payload;
    },
  },
});

export const { setLoading } = loadingSlice.actions;
export const loadingReducer = loadingSlice.reducer;