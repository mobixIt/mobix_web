'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { MembershipResponse, EffectiveModule } from '@/types/access-control';
import { fetchUserMembership } from '@/services/userAuthService';
import { buildEffectiveModulesFromMembership } from '@/utils/membershipModules';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Shape of the error returned when loading memberships/permissions fails.
 * It loosely matches the JSON:API error structure used by the backend.
 */
export type PermissionsError = {
  code: string;
  title: string;
  detail: string;
} | null;

/**
 * Redux state for permissions and effective modules
 * for the current tenant / membership context.
 */
export type PermissionsState = {
  /**
   * Indicates if permissions/membership are currently being loaded.
   */
  loading: boolean;

  /**
   * Error information produced while loading membership or permissions.
   * `null` when there is no error.
   */
  error: PermissionsError;

  /**
   * Raw membership response returned by the backend
   * (may contain memberships for multiple tenants).
   */
  membership: MembershipResponse | null;

  /**
   * Flattened, module-centric representation of the permissions
   * for the current tenant, derived from the membership.
   */
  effectiveModules: ReturnType<typeof buildEffectiveModulesFromMembership> | [];
};

/**
 * Initial state of the permissions slice.
 */
const initialState: PermissionsState = {
  loading: false,
  error: null,
  membership: null,
  effectiveModules: [],
};

/**
 * Thunk that loads the current user's membership for a given tenant,
 * and derives the "effective modules" for that tenant.
 *
 * Payload:
 * - arg: `tenantSlug` (string)
 * - fulfilled: `{ membership, tenantSlug }`
 */
export const loadTenantPermissions = createAsyncThunk<
  { membership: MembershipResponse; tenantSlug: string },
  string,
  { rejectValue: NonNullable<PermissionsError> }
>(
  'permissions/loadTenantPermissions',
  async (tenantSlug: string, thunkAPI) => {
    try {
      const response = await fetchUserMembership(tenantSlug);
      return { membership: response.data, tenantSlug };
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const apiError = err?.response?.data?.errors?.[0];

      return thunkAPI.rejectWithValue({
        code: apiError?.code ?? 'UNKNOWN_ERROR',
        title: apiError?.title ?? 'Dashboard error',
        detail:
          apiError?.detail ??
          'Something went wrong while loading memberships.',
      });
    }
  },
);

/**
 * Permissions slice:
 * - stores raw membership data
 * - stores the derived effective modules for the current tenant
 * - tracks loading and error state
 */
export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    /**
     * Clears permission-related state, typically on logout
     * or when switching away from the current tenant.
     */
    clearPermissions: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      /**
       * While `loadTenantPermissions` is pending,
       * set loading, and clear previous errors.
       */
      .addCase(loadTenantPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /**
       * When `loadTenantPermissions` succeeds:
       * - store the raw membership
       * - find the membership for the given tenant
       * - build effective modules for that tenant
       */
      .addCase(
        loadTenantPermissions.fulfilled,
        (
          state,
          action: PayloadAction<{
            membership: MembershipResponse;
            tenantSlug: string;
          }>,
        ) => {
          state.loading = false;
          state.membership = action.payload.membership;

          const membershipForTenant =
            action.payload.membership.memberships.find(
              (m) => m.tenant.slug === action.payload.tenantSlug,
            );

          state.effectiveModules = membershipForTenant
            ? buildEffectiveModulesFromMembership(membershipForTenant)
            : [];
        },
      )

      /**
       * When `loadTenantPermissions` fails:
       * - set structured error information
       * - reset membership and effective modules
       */
      .addCase(loadTenantPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as PermissionsError) ?? {
            code: 'UNKNOWN_ERROR',
            title: 'Dashboard error',
            detail: 'Unknown error while loading memberships.',
          };
        state.membership = null;
        state.effectiveModules = [];
      });
  },
});

export const { clearPermissions } = permissionsSlice.actions;

/**
 * Selector that returns the loading flag for permissions.
 */
export const selectPermissionsLoading = (state: RootState) =>
  state.permissions.loading;

/**
 * Selector that returns the structured error (if any)
 * produced while loading tenant permissions.
 */
export const selectPermissionsError = (state: RootState) =>
  state.permissions.error;

/**
 * Selector that returns the effective modules for the current tenant,
 * as computed from the membership.
 */
export const selectEffectiveModules = (state: RootState) =>
  state.permissions.effectiveModules;

/**
 * Selector that returns the raw membership response
 * (may contain memberships for multiple tenants).
 */
export const selectMembershipRaw = (state: RootState) =>
  state.permissions.membership;

/**
 * Selector factory:
 * Given a subject name (e.g. "Vehicle" or "Route"),
 * returns a selector that retrieves the list of allowed actions
 * for that subject across the effective modules.
 */
export const selectActionsForSubject =
  (subject: string) =>
  (state: RootState): string[] => {
    const modules: EffectiveModule[] = state.permissions.effectiveModules;

    const mod = modules.find((m) =>
      Object.prototype.hasOwnProperty.call(m.actionsBySubject, subject),
    );

    return mod?.actionsBySubject?.[subject] ?? [];
  };

/**
 * Selector factory:
 * Given a module name (e.g. "Vehicles" or "Reports"),
 * returns a selector that finds the matching effective module.
 *
 * Module name comparison is case-insensitive.
 */
export const selectModuleByKey =
  (moduleName: string) =>
  (state: RootState): EffectiveModule | undefined => {
    const name = moduleName.toLowerCase();

    return state.permissions.effectiveModules.find(
      (m) => m.appModuleName.toLowerCase() === name,
    );
  };

export default permissionsSlice.reducer;
