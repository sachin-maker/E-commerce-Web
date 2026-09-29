import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/services/authService";

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = false;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },

    finishInitialization: (state) => {
      state.isInitialized = true;
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    updateUser: (state, action: PayloadAction<User>) => {
  state.user = action.payload;
},
  },
});

export const {
  restoreToken,
  setCredentials,
  finishInitialization,
  logout,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;

