import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CategoryType } from "../types/category";

export interface ExecutorState {
  id: number;
  name?: string | null;
  email?: string | null;
  phone: string;
  status?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  categories?: CategoryType[];
  unp?: number | null;
  isWorkInShhabat?: boolean | null;
  adress?: string | null;
}

const initialState: ExecutorState = {
  id: 0,
  name: null,
  email: null,
  phone: "",
  status: 0,
  latitude: 0,
  longitude: 0,
  radius: 0,
  categories: [],
  unp: null,
  isWorkInShhabat: null,
  adress: null,
};

export const emptyExecutor = (): ExecutorState => ({ ...initialState });

const executorSlice = createSlice({
  name: "executor",
  initialState,
  reducers: {
    setExecutor: (state, action: PayloadAction<ExecutorState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.status = action.payload.status;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.radius = action.payload.radius;
      state.categories = action.payload.categories;
      state.unp = action.payload.unp;
      state.isWorkInShhabat = action.payload.isWorkInShhabat;
      state.adress = action.payload.adress;
    },
  },
});

export const { setExecutor } = executorSlice.actions;
export default executorSlice.reducer;
