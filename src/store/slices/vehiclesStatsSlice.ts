import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { normalizeApiError } from '@/errors/normalizeApiError';
import {
  fetchVehiclesStatsFromApi,
  type VehiclesStatsData,
  type VehiclesStatsMeta,
} from '@/services/vehiclesStatsService';

export type VehiclesStatsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type VehiclesStatsError = {
  message: string;
  status?: number;
} | null;

export type TenantVehiclesStatsState = {
  data: VehiclesStatsData | null;
  meta: VehiclesStatsMeta | null;
  status: VehiclesStatsStatus;
  error: VehiclesStatsError;
  lastFetchedAt: string | null;
};

export type VehiclesStatsState = {
  byTenant: Record<string, TenantVehiclesStatsState>;
};

const createEmptyTenantState = (): TenantVehiclesStatsState => ({
  data: null,
  meta: null,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
});

const initialState: VehiclesStatsState = {
  byTenant: {},
};

export type FetchVehiclesStatsArgs = {
  tenantSlug: string;
  force?: boolean;
};

type FetchVehiclesStatsPayload = {
  data: VehiclesStatsData;
  meta: VehiclesStatsMeta;
};

export function shouldFetchVehiclesStats(args: FetchVehiclesStatsArgs, state: RootState): boolean {
  const tenantSlug = args.tenantSlug;
  if (!tenantSlug) return true;

  const tenantState = state.vehiclesStats.byTenant[tenantSlug];
  if (!tenantState) return true;

  if (args.force) return true;

  if (tenantState.status === 'loading') return false;

  return tenantState.lastFetchedAt == null;
}

export const fetchVehiclesStats = createAsyncThunk<
  FetchVehiclesStatsPayload,
  FetchVehiclesStatsArgs,
  { state: RootState; rejectValue: NonNullable<VehiclesStatsError> }
>(
  'vehiclesStats/fetchVehiclesStats',
  async (args, { rejectWithValue }) => {
    try {
      const response = await fetchVehiclesStatsFromApi(args.tenantSlug);
      return { data: response.data, meta: response.meta };
    } catch (err) {
      const normalized = normalizeApiError(err, {
        defaultMessage: 'Failed to load vehicles stats',
      });

      return rejectWithValue({
        message: normalized.message,
        status: normalized.status,
      });
    }
  },
  {
    condition: (args, { getState }) => shouldFetchVehiclesStats(args, getState()),
  },
);

const vehiclesStatsSlice = createSlice({
  name: 'vehiclesStats',
  initialState,
  reducers: {
    clearVehiclesStats(state, action: PayloadAction<string | undefined>) {
      const tenantSlug = action.payload;
      if (!tenantSlug) {
        state.byTenant = {};
        return;
      }
      if (state.byTenant[tenantSlug]) delete state.byTenant[tenantSlug];
    },
    invalidateVehiclesStatsCache(state, action: PayloadAction<string | undefined>) {
      const tenantSlug = action.payload;
      if (!tenantSlug) {
        Object.values(state.byTenant).forEach((s) => {
          s.lastFetchedAt = null;
        });
        return;
      }
      const existing = state.byTenant[tenantSlug];
      if (existing) existing.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehiclesStats.pending, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState = state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'loading';
        tenantState.error = null;

        state.byTenant[tenantSlug] = tenantState;
      })
      .addCase(fetchVehiclesStats.fulfilled, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState = state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'succeeded';
        tenantState.data = action.payload.data;
        tenantState.meta = action.payload.meta;
        tenantState.error = null;
        tenantState.lastFetchedAt = new Date().toISOString();

        state.byTenant[tenantSlug] = tenantState;
      })
      .addCase(fetchVehiclesStats.rejected, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState = state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'failed';
        tenantState.error = action.payload ?? { message: 'Unknown error' };

        state.byTenant[tenantSlug] = tenantState;
      });
  },
});

export const { clearVehiclesStats, invalidateVehiclesStatsCache } = vehiclesStatsSlice.actions;

export const selectVehiclesStatsData = (state: RootState, tenantSlug: string) =>
  state.vehiclesStats.byTenant[tenantSlug]?.data ?? null;

export const selectVehiclesStatsMeta = (state: RootState, tenantSlug: string) =>
  state.vehiclesStats.byTenant[tenantSlug]?.meta ?? null;

export const selectVehiclesStatsStatus = (state: RootState, tenantSlug: string) =>
  state.vehiclesStats.byTenant[tenantSlug]?.status ?? 'idle';

export const selectVehiclesStatsError = (state: RootState, tenantSlug: string) =>
  state.vehiclesStats.byTenant[tenantSlug]?.error ?? null;

export default vehiclesStatsSlice.reducer;
