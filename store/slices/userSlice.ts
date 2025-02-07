import { apiCall } from "@/lib/api";
import { Credits, User } from "@prisma/client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type UserData = User & {
  credits: Credits;
};

export interface UserState {
  data: UserData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchUserData = createAsyncThunk<UserData>(
  "user/fetchUserData",
  async () => {
    const data = await apiCall("GET", "/api/user");
    if (!data) {
      throw new Error("Failed to fetch user data");
    }
    return data.user;
  },
);

export const updateUserData = createAsyncThunk<UserData>(
  "user/updateUserData",
  async () => {
    const data = await apiCall("GET", "/api/user");
    if (!data) {
      throw new Error("Failed to fetch user data");
    }
    return data.user;
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserData>) {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch user data";
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update user data";
      });
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
