import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API } from "../../../API/api";

export interface Part {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  unit_price: number;
  manufacturer?: string;
  link?: string;
}

export type NewPart = Omit<Part, "id">;

interface PartState {
  parts: Part[];
  loading: boolean;
  error: string | null;
}

const initialState: PartState = {
  parts: [],
  loading: false,
  error: null,
};

// const partApi = API.parts;
const partApi = "http://localhost:3001/parts";

export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(partApi);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Network Error",
      );
    }
  },
);

export const addPart = createAsyncThunk(
  "parts/addPart",
  async (newPart: NewPart, { rejectWithValue }) => {
    try {
      const res = await axios.post(partApi, newPart);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Network Error",
      );
    }
  },
);

export const editPart = createAsyncThunk(
  "parts/editPart",
  async (editedPart: Part, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${partApi}/${editedPart.id}`, editedPart);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Network Error",
      );
    }
  },
);

export const deletePart = createAsyncThunk(
  "parts/deletePart",
  async (partId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${partApi}/${partId}`);
      return partId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Network Error",
      );
    }
  },
);

const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.parts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(addPart.fulfilled, (state, action) => {
        state.parts.push(action.payload);
      })
      .addCase(addPart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(editPart.fulfilled, (state, action) => {
        const updatedPart = action.payload;
        state.parts = state.parts.map((p) =>
          p.id === updatedPart.id ? updatedPart : p,
        );
      })
      .addCase(editPart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.parts = state.parts.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default partsSlice.reducer;
