import { View } from "@/interfaces/Interfaces";
import { createSlice } from "@reduxjs/toolkit";

export const viewSlice = createSlice({
  name: "view",
  initialState: {
    view: View.HEAP_HOME,
  },
  reducers: {
    switchToHeapHome: (state) => {
      state.view = View.HEAP_HOME;
    },
    switchToHeapArchive: (state) => {
      state.view = View.HEAP_ARCHIVE;
    },
  },
});

export const { switchToHeapHome, switchToHeapArchive } = viewSlice.actions;

export default viewSlice.reducer;
