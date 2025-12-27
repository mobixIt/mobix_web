import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';
import type { Vehicle } from '@/types/vehicles/api';
import type { PaginationMeta } from '@/hooks/usePaginatedIndex';
import {
  fetchVehiclesFromApi,
  type VehiclesIndexParams,
} from '@/services/vehiclesService';
import { normalizeApiError } from '@/errors/normalizeApiError';

/* -------------------------------------------------------------------------- */
/*                                    STATE                                   */
/* -------------------------------------------------------------------------- */

/**
 * State for vehicles belonging to a single tenant.
 * Each tenant maintains its own set of:
 * - fetched vehicle items
 * - fetch status
 * - last fetch timestamp
 * - pagination metadata
 * - last used page/size (used for cache validation)
 */
export interface TenantVehiclesState {
  items: Vehicle[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  errorCode: string | null;
  lastFetchedAt: string | null;
  pagination: PaginationMeta | null;
  lastPage: number | null;
  lastPageSize: number | null;
  lastFiltersSig: string | null;
  aiActive: boolean;
  aiQuestion: string | null;
  aiExplanation: string | null;
  aiAppliedFilters: Record<string, string | string[] | number | null> | null;
}

/**
 * Global vehicles state keyed by tenant slug.
 * Example structure:
 * {
 *   byTenant: {
 *     "tenant-a": { ...TenantVehiclesState },
 *     "tenant-b": { ...TenantVehiclesState }
 *   }
 * }
 */
export interface VehiclesState {
  byTenant: Record<string, TenantVehiclesState>;
}

/**
 * Creates a clean/default tenant state object.
 */
const createEmptyTenantState = (): TenantVehiclesState => ({
  items: [],
  status: 'idle',
  error: null,
  errorCode: null,
  lastFetchedAt: null,
  pagination: null,
  lastPage: null,
  lastPageSize: null,
  lastFiltersSig: null,
  aiActive: false,
  aiQuestion: null,
  aiExplanation: null,
  aiAppliedFilters: null,
});

const initialState: VehiclesState = {
  byTenant: {},
};

function stableFiltersSig(filters: unknown): string {
  const obj = (filters && typeof filters === 'object') ? (filters as Record<string, unknown>) : {};
  const entries = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => [k, String(v)])
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(entries);
}

function stableQuerySig(params?: VehiclesIndexParams): string {
  const filtersSig = stableFiltersSig(params?.filters);
  const aiSig = params?.ai_question ? params.ai_question.trim() : '';
  return JSON.stringify({ filters: filtersSig, ai: aiSig });
}

/**
 * Default cache expiration time for vehicle data (in ms).
 * If NEXT_PUBLIC_VEHICLES_CACHE_TTL_MS is provided, it overrides the default.
 * Otherwise, fallback is 1 hour.
 */
const DEFAULT_TTL_MS = 60 * 60 * 1000;
const VEHICLES_CACHE_TTL_MS =
  Number(process.env.NEXT_PUBLIC_VEHICLES_CACHE_TTL_MS) || DEFAULT_TTL_MS;

/* -------------------------------------------------------------------------- */
/*                                    THUNK                                   */
/* -------------------------------------------------------------------------- */

/**
 * Arguments required to fetch vehicles:
 * - tenantSlug (required)
 * - params: pagination, filters, etc.
 */
export interface FetchVehiclesArgs {
  tenantSlug: string;
  params?: VehiclesIndexParams;
}

/**
 * Successful payload returned by fetchVehicles.
 */
interface FetchVehiclesPayload {
  items: Vehicle[];
  pagination: PaginationMeta | null;
  aiActive: boolean;
  aiQuestion: string | null;
  aiExplanation: string | null;
  aiAppliedFilters: Record<string, string | string[] | number | null> | null;
}

/**
 * Determines whether the vehicles list for a given tenant should be fetched from the API.
 *
 * This function centralizes all cache- and pagination-related logic used by the `fetchVehicles`
 * thunk. It evaluates:
 *
 * - Missing tenant slug → always fetch.
 * - Tenant has no stored state → fetch.
 * - No previous `lastFetchedAt` timestamp → fetch.
 * - Requested page or size differs from the last fetched values → fetch.
 * - Stored timestamp cannot be parsed → fetch.
 * - Cache TTL expired → fetch.
 * - Otherwise, do **not** fetch because the cached data is still valid.
 *
 * @param args - Parameters passed to the fetch operation, including `tenantSlug` and optional pagination.
 * @param state - The Redux root state, used to access cached tenant vehicle data.
 *
 * @returns `true` if a new API request should be made, `false` when cached data is valid and reused.
 */
export function shouldFetchVehicles(args: FetchVehiclesArgs, state: RootState): boolean {
  const tenantSlug = args?.tenantSlug;
  if (!tenantSlug) return true;

  const tenantState = state.vehicles.byTenant[tenantSlug];
  if (!tenantState) return true;

  const lastFetchedAt = tenantState.lastFetchedAt;

  const requestedPage = args.params?.page?.number ?? 1;
  const requestedSize = args.params?.page?.size ?? tenantState.lastPageSize ?? 10;

  const requestedFiltersSig = stableQuerySig(args.params);
  const lastFiltersSig = tenantState.lastFiltersSig ?? stableQuerySig(undefined);

  if (!lastFetchedAt) return true;

  if (requestedFiltersSig !== lastFiltersSig) return true;

  if (tenantState.lastPage !== requestedPage || tenantState.lastPageSize !== requestedSize) {
    return true;
  }

  const last = new Date(lastFetchedAt).getTime();
  if (Number.isNaN(last)) return true;

  return (Date.now() - last) > VEHICLES_CACHE_TTL_MS;
}

/**
 * Thunk to fetch vehicles for a tenant.
 *
 * Features:
 * - Handles API call via fetchVehiclesFromApi()
 * - Extracts items and pagination
 * - Normalizes API errors before dispatching rejected actions
 * - Includes a `condition` to enable request deduplication and caching
 */
export const fetchVehicles = createAsyncThunk<
  FetchVehiclesPayload,
  FetchVehiclesArgs,
  { state: RootState; rejectValue: { message: string; status?: number; code?: string } }
>(
  'vehicles/fetchVehicles',
  async (args, { rejectWithValue }) => {
    try {
      const { tenantSlug, params } = args;
      const response = await fetchVehiclesFromApi(tenantSlug, params);

      const items = response.data;
      const pagination =
        (response.meta?.pagination as PaginationMeta | undefined) ?? null;

      return {
        items,
        pagination,
        aiActive: Boolean(response.meta?.ai),
        aiQuestion: response.meta?.ai ? params?.ai_question ?? null : null,
        aiExplanation: response.meta?.ai_explanation ?? null,
        aiAppliedFilters: response.meta?.applied_filters ?? null,
      };
    } catch (err) {
      const normalized = normalizeApiError(err, {
        defaultMessage: 'Failed to load vehicles list',
      });

      return rejectWithValue({
        message: normalized.message,
        code: normalized.code,
        status: normalized.status,
      });

    }
  },
  {
    condition: (args, { getState }) => {
      return shouldFetchVehicles(args, getState());
    },
  },
);

/* -------------------------------------------------------------------------- */
/*                                    SLICE                                   */
/* -------------------------------------------------------------------------- */

/**
 * Vehicles slice responsible for storing per-tenant vehicle lists,
 * their fetch status, pagination metadata, cache timestamps, etc.
 */
const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    /**
     * Clears vehicles for:
     * - all tenants (if payload undefined)
     * - a specific tenant
     */
    clearVehicles(state, action: PayloadAction<string | undefined>) {
      const tenantSlug = action.payload;

      if (!tenantSlug) {
        state.byTenant = {};
        return;
      }

      if (state.byTenant[tenantSlug]) {
        delete state.byTenant[tenantSlug];
      }
    },

    /**
     * Invalidates cache by resetting the lastFetchedAt timestamp.
     * This ensures next fetch call bypasses cached results.
     * Works globally or per-tenant.
     */
    invalidateVehiclesCache(state, action: PayloadAction<string | undefined>) {
      const tenantSlug = action.payload;

      if (!tenantSlug) {
        Object.values(state.byTenant).forEach((tenantState) => {
          tenantState.lastFetchedAt = null;
        });
        return;
      }

      if (state.byTenant[tenantSlug]) {
        state.byTenant[tenantSlug].lastFetchedAt = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /**
       * Handles the pending state:
       * - initializes tenant state if missing
       * - sets status=loading
       * - clears error
       */
      .addCase(fetchVehicles.pending, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState =
          state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'loading';
        tenantState.error = null;
        tenantState.errorCode = null;
        tenantState.aiExplanation = null;
        tenantState.aiAppliedFilters = null;

        if (action.meta.arg.params?.ai_question) {
          tenantState.aiQuestion = action.meta.arg.params.ai_question;
        }

        state.byTenant[tenantSlug] = tenantState;
      })

      /**
       * Handles the fulfilled state:
       * - writes items
       * - stores pagination
       * - stores last fetch timestamp
       * - tracks page and size used (for caching)
       */
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState =
          state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'succeeded';
        tenantState.items = action.payload.items;
        tenantState.lastFetchedAt = new Date().toISOString();
        tenantState.pagination = action.payload.pagination;

        tenantState.lastFiltersSig = stableQuerySig(action.meta.arg.params);

        tenantState.aiActive = action.payload.aiActive;
        tenantState.aiQuestion = action.payload.aiQuestion;
        tenantState.aiExplanation = action.payload.aiExplanation;
        tenantState.aiAppliedFilters = action.payload.aiAppliedFilters;

        const requestedPage =
          action.meta.arg.params?.page?.number ??
          action.payload.pagination?.page ??
          1;
        const requestedSize =
          action.meta.arg.params?.page?.size ??
          action.payload.pagination?.per_page ??
          tenantState.lastPageSize ??
          10;

        tenantState.lastPage = requestedPage;
        tenantState.lastPageSize = requestedSize;

        state.byTenant[tenantSlug] = tenantState;
      })

      /**
       * Handles rejected state:
       * - updates status
       * - stores error message
       */
      .addCase(fetchVehicles.rejected, (state, action) => {
        if (!action.payload) return;

        const tenantSlug = action.meta.arg.tenantSlug;
        const tenantState =
          state.byTenant[tenantSlug] ?? createEmptyTenantState();

        tenantState.status = 'failed';
        tenantState.error = action.payload.message;
        tenantState.errorCode = action.payload.code ?? null;
        tenantState.aiActive = false;
        tenantState.aiQuestion = null;
        tenantState.aiExplanation = null;
        tenantState.aiAppliedFilters = null;

        state.byTenant[tenantSlug] = tenantState;
      });
  },
});

export const { clearVehicles, invalidateVehiclesCache } = vehiclesSlice.actions;

/* -------------------------------------------------------------------------- */
/*                                 SELECTORS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns list of vehicles for a tenant.
 */
const EMPTY_ITEMS: Vehicle[] = [];
const EMPTY_AI_META = {
  aiActive: false,
  aiQuestion: null,
  aiExplanation: null,
  aiAppliedFilters: null,
  errorCode: null as string | null,
};

export const selectVehicles = createSelector(
  [(state: RootState, tenantSlug: string) => state.vehicles.byTenant[tenantSlug]?.items],
  (items) => items ?? EMPTY_ITEMS,
);

/**
 * Returns fetch status for tenant's vehicles.
 */
export const selectVehiclesStatus = (state: RootState, tenantSlug: string) =>
  state.vehicles.byTenant[tenantSlug]?.status ?? 'idle';

/**
 * Returns error message for a tenant’s last fetch attempt.
 */
export const selectVehiclesError = (state: RootState, tenantSlug: string) =>
  state.vehicles.byTenant[tenantSlug]?.error ?? null;

export const selectVehiclesAiMeta = createSelector(
  [(state: RootState, tenantSlug: string) => state.vehicles.byTenant[tenantSlug]],
  (tenant) => {
    if (!tenant) return EMPTY_AI_META;
    return {
      aiActive: tenant.aiActive,
      aiQuestion: tenant.aiQuestion,
      aiExplanation: tenant.aiExplanation,
      aiAppliedFilters: tenant.aiAppliedFilters,
      errorCode: tenant.errorCode,
    };
  },
);

/**
 * Returns pagination metadata for a tenant.
 */
export const selectVehiclesPagination = (state: RootState, tenantSlug: string) =>
  state.vehicles.byTenant[tenantSlug]?.pagination ?? null;

export default vehiclesSlice.reducer;
