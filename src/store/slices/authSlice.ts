import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo } from '@/services/userAuthService';
import type { MeResponse } from '@/types/access-control';
import type { RootState } from '@/store/store';

export interface AuthState {
  me: MeResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  me: null,
  status: 'idle',
  error: null,
};

// Thunk para pedir /me
export const fetchMe = createAsyncThunk<MeResponse, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchUserInfo();
      return data;
    } catch {
      return rejectWithValue('No se pudo cargar la información del usuario');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.me = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.me = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Error desconocido';
        state.me = null;
      });
  },
});

export const { clearAuth } = authSlice.actions;

export const selectCurrentPerson = (state: RootState) => state.auth.me;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;