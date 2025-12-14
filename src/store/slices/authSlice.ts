import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo } from '@/services/userAuthService';
import type { MeResponse } from '@/types/access-control';
import type { RootState } from '@/store/store';
import { normalizeApiError } from '@/errors/normalizeApiError';

export interface AuthState {
  me: MeResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  errorStatus: number | null;
}

const initialState: AuthState = {
  me: null,
  status: 'idle',
  error: null,
  errorStatus: null,
};

export const fetchMe = createAsyncThunk<
  MeResponse,
  void,
  { rejectValue: { message: string; status?: number }; state: RootState }
>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchUserInfo();
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err, {
        defaultMessage: 'No se pudo cargar la información del usuario',
      });

      return rejectWithValue({
        message: normalized.message,
        status: normalized.status,
      });
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      return state.auth.status === 'idle';
    },
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
      state.errorStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorStatus = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.me = action.payload;
        state.errorStatus = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload?.message ?? 'Error desconocido';
        state.errorStatus =
          action.payload?.status ?? null;
        state.me = null;
      });
  },
});

export const { clearAuth } = authSlice.actions;

export const selectCurrentPerson = (state: RootState) => state.auth.me;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthErrorStatus = (state: RootState) => state.auth.errorStatus;

export default authSlice.reducer;
