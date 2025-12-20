import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { normalizeApiError } from '@/errors/normalizeApiError';
import { resolveCatalogs, type CatalogOption } from '@/services/catalogsService';

export type VehiclesCatalogKeys =
  | 'brands'
  | 'vehicle_classes'
  | 'body_types'
  | 'owners'
  | 'drivers';

export type VehiclesCatalogsPayload = {
  brands: CatalogOption[];
  vehicle_classes: CatalogOption[];
  body_types: CatalogOption[];
  owners: CatalogOption[];
  drivers: CatalogOption[];
};

export type VehiclesCatalogsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type VehiclesCatalogsError = {
  message: string;
  status?: number;
} | null;

export type TenantVehiclesCatalogsState = {
  data: VehiclesCatalogsPayload | null;
  status: VehiclesCatalogsStatus;
  error: VehiclesCatalogsError;
  lastFetchedAt: string | null;
};

export type VehiclesCatalogsState = {
  byTenant: Record<string, TenantVehiclesCatalogsState>;
};

const createEmptyTenantState = (): TenantVehiclesCatalogsState => ({
  data: null,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
});

const initialState: VehiclesCatalogsState = {
  byTenant: {},
};

export type FetchVehiclesCatalogsArgs = {
  tenantSlug: string;
  force?: boolean;
};

const VEHICLES_CATALOG_KEYS: VehiclesCatalogKeys[] = [
  'brands',
  'vehicle_classes',
  'body_types',
  'owners',
  'drivers',
];

export function shouldFetchVehiclesCatalogs(
  args: FetchVehiclesCatalogsArgs,
  state: RootState,
): boolean {
  const tenantSlug = args.tenantSlug;
  if (!tenantSlug) return true;

  const tenantState = state.vehiclesCatalogs.byTenant[tenantSlug];
  if (!tenantState) return true;

  if (args.force) return true;
  if (tenantState.status === 'loading') return false;

  // cache por sesión: si ya tenemos data, no volver a pedir
  return tenantState.data == null;
}

export const fetchVehiclesCatalogs = createAsyncThunk<
  VehiclesCatalogsPayload,
  FetchVehiclesCatalogsArgs,
  { state: RootState; rejectValue: NonNullable<VehiclesCatalogsError> }
>(
  'vehiclesCatalogs/fetchVehiclesCatalogs',
  async (args, { rejectWithValue }) => {
    try {
      const res = await resolveCatalogs(args.tenantSlug, VEHICLES_CATALOG_KEYS);

      const payload: VehiclesCatalogsPayload = {
        brands: res.data.brands ?? [],
        vehicle_classes: res.data.vehicle_classes ?? [],
        body_types: res.data.body_types ?? [],
        owners: res.data.owners ?? [],
        drivers: res.data.drivers ?? [],
      };

      return payload;
    } catch (err) {
      const normalized = normalizeApiError(err, {
        defaultMessage: 'Failed to load vehicles catalogs',
      });

      return rejectWithValue({
        message: normalized.message,
        status: normalized.status,
      });
    }
  },
  {
    condition: (args, { getState }) => shouldFetchVehiclesCatalogs(args, getState()),
  },
);

const vehiclesCatalogsSlice = createSlice({
  name: 'vehiclesCatalogs',
  initialState,
  reducers: {
    clearVehiclesCatalogs(state, action: PayloadAction<string | undefined>) {
      const tenantSlug = action.payload;
      if (!tenantSlug) {
        state.byTenant = {};
        return;
      }
      if (state.byTenant[tenantSlug]) delete state.byTenant[tenantSlug];
    },
    invalidateVehiclesCatalogsCache(state, action: PayloadAction<string | undefined>) {
      const tenantSlug = action.payload;
      if (!tenantSlug) {
        Object.values(state.byTenant).forEach((s) => {
          s.data = null;
          s.lastFetchedAt = null;
          s.status = 'idle';
          s.error = null;
        });
        return;
      }
      const existing = state.byTenant[tenantSlug];
      if (existing) {
        existing.data = null;
        existing.lastFetchedAt = null;
        existing.status = 'idle';
        existing.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehiclesCatalogs.pending, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState = state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'loading';
        tenantState.error = null;

        state.byTenant[tenantSlug] = tenantState;
      })
      .addCase(fetchVehiclesCatalogs.fulfilled, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState = state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'succeeded';
        tenantState.data = action.payload;
        tenantState.error = null;
        tenantState.lastFetchedAt = new Date().toISOString();

        state.byTenant[tenantSlug] = tenantState;
      })
      .addCase(fetchVehiclesCatalogs.rejected, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState = state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'failed';
        tenantState.error = action.payload ?? { message: 'Unknown error' };

        state.byTenant[tenantSlug] = tenantState;
      });
  },
});

export const { clearVehiclesCatalogs, invalidateVehiclesCatalogsCache } =
  vehiclesCatalogsSlice.actions;

export const selectVehiclesCatalogsState = (state: RootState, tenantSlug: string) =>
  state.vehiclesCatalogs.byTenant[tenantSlug] ?? createEmptyTenantState();

export const selectVehiclesCatalogsData = (state: RootState, tenantSlug: string) =>
  state.vehiclesCatalogs.byTenant[tenantSlug]?.data ?? null;

export const selectVehiclesCatalogsStatus = (state: RootState, tenantSlug: string) =>
  state.vehiclesCatalogs.byTenant[tenantSlug]?.status ?? 'idle';

export const selectVehiclesCatalogsError = (state: RootState, tenantSlug: string) =>
  state.vehiclesCatalogs.byTenant[tenantSlug]?.error ?? null;

export default vehiclesCatalogsSlice.reducer;