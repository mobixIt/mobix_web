'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type {
  MembershipResponse,
  EffectiveModule,
  Membership,
  Role,
  TenantPermission,
} from '@/types/access-control';
import { fetchUserMembership } from '@/services/userAuthService';
import { buildEffectiveModulesFromMembership } from '@/utils/membershipModules';
import { VEHICLE_READ_ATTRIBUTES } from '@/types/vehicles/api';
import { normalizeApiError } from '@/errors/normalizeApiError';

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
 * Thunk that loads the current user's membership for a given tenant
 * and derives the "effective modules" for that tenant.
 *
 * - `arg` is the tenant slug (string).
 * - On success, the payload contains the full `membership` response and the `tenantSlug`.
 *
 * The thunk:
 * - Calls `fetchUserMembership(tenantSlug)`.
 * - On success, returns `{ membership, tenantSlug }`.
 * - On failure, returns a structured error through `rejectWithValue`.
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
      const normalized = normalizeApiError(error, {
        defaultMessage: 'Something went wrong while loading memberships.',
        useAxiosMessageAsFallback: false
      });

      return thunkAPI.rejectWithValue({
        code: normalized.code ?? 'UNKNOWN_ERROR',
        title: normalized.title ?? 'Dashboard error',
        detail:
          normalized.detail ??
          'Something went wrong while loading memberships.',
      });
    }
  },
);

/**
 * Permissions slice:
 * - Stores raw membership data for the authenticated user.
 * - Stores the derived effective modules for the current tenant.
 * - Tracks loading and error state for permission-related operations.
 */
export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    /**
     * Clears the entire permission-related state.
     *
     * Typically used on:
     * - Logout.
     * - Tenant change where permission state must be fully reset.
     */
    clearPermissions: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      /**
       * While `loadTenantPermissions` is pending:
       * - set `loading` to true
       * - clear any previous error
       */
      .addCase(loadTenantPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /**
       * When `loadTenantPermissions` succeeds:
       * - store the raw membership response
       * - locate the membership entry for the given tenant
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
       * - set a structured error object
       * - reset membership and effectiveModules
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
 * Selector that returns the loading flag for permissions state.
 *
 * @param state - Redux root state.
 * @returns `true` if permissions are currently being loaded, otherwise `false`.
 */
export const selectPermissionsLoading = (state: RootState) =>
  state.permissions.loading;

/**
 * Selector that returns the structured error (if any)
 * produced while loading tenant permissions.
 *
 * @param state - Redux root state.
 * @returns A `PermissionsError` object or `null` when there is no error.
 */
export const selectPermissionsError = (state: RootState) =>
  state.permissions.error;

/**
 * Selector that returns the effective modules for the current tenant,
 * as computed from the membership data.
 *
 * @param state - Redux root state.
 * @returns An array of `EffectiveModule` objects, or an empty array.
 */
export const selectEffectiveModules = (state: RootState) =>
  state.permissions.effectiveModules;

/**
 * Selector that returns the raw membership response
 * (which may contain memberships for multiple tenants).
 *
 * @param state - Redux root state.
 * @returns The `MembershipResponse` or `null` if not loaded.
 */
export const selectMembershipRaw = (state: RootState) =>
  state.permissions.membership;

/**
 * Selector factory:
 *
 * Given a subject name (e.g. `"Vehicle"` or `"Route"`),
 * returns a selector that retrieves the list of allowed actions
 * for that subject across the effective modules.
 *
 * @param subject - Subject name used as key in `actionsBySubject`.
 * @returns A selector that returns the list of allowed action strings.
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
 *
 * Given a module key/name (e.g. `"Vehicles"` or `"Reports"`),
 * returns a selector that finds the matching effective module.
 *
 * The comparison is case-insensitive.
 *
 * @param moduleName - Name/key of the module to look for.
 * @returns A selector that returns the matching `EffectiveModule` or `undefined`.
 */
export const selectModuleByKey =
  (moduleName: string) =>
  (state: RootState): EffectiveModule | undefined => {
    const name = moduleName.toLowerCase();

    return state.permissions.effectiveModules.find(
      (m) => m.appModuleName.toLowerCase() === name,
    );
  };

/**
 * Map of subject-class identifiers to the full list of readable attributes
 * for that subject. This represents the "universe" of attributes used when
 * computing allow/deny lists.
 */
const READ_ATTRIBUTES_BY_SUBJECT: Record<string, string[]> = {
  vehicle: VEHICLE_READ_ATTRIBUTES as string[],
};

/**
 * Selector factory:
 *
 * Given a tenant, subject class (e.g. `"vehicle"`) and action
 * (e.g. `"read"`), returns the **effective list of allowed attributes**
 * for that combination, applying the following semantics:
 *
 * - No `TenantPermission` for that subject/action:
 *   - Interpret as global/full access → all attributes for the subject.
 *
 * - At least one `TenantPermission` where:
 *   - `allow_attributes` and `deny_attributes` are **both empty** across all matches:
 *     - Full access → all attributes for the subject.
 *
 *   - There is at least one `allow_attributes`:
 *     - Whitelist behavior → union of all allowed attributes.
 *
 *   - There are only `deny_attributes` (no `allow_attributes` anywhere):
 *     - Blacklist behavior → all attributes minus the union of denied attributes.
 *
 * Return value semantics:
 * - `null` → no membership or no tenant membership data available.
 *            The caller may choose a conservative fallback (e.g. minimal safe fields).
 * - `string[]` → explicit list of allowed attributes.
 *
 * @param tenantSlug - Current tenant slug, or `null` if no tenant is selected.
 * @param subjectClass - Subject class identifier (e.g. `"vehicle"`).
 * @param action - Action name (e.g. `"read"`, `"update"`).
 *
 * @returns A selector that resolves to:
 * - `null` if there is no membership/tenant context.
 * - An array of allowed attribute names (subset or full set).
 */
export const selectAllowedAttributesForSubjectAndAction =
  (tenantSlug: string | null, subjectClass: string, action: string) =>
  (state: RootState): string[] | null => {
    if (!tenantSlug) return null;

    const membership: MembershipResponse | null =
      state.permissions.membership;

    if (!membership) return null;

    // Membership for the current tenant
    const membershipForTenant: Membership | undefined =
      membership.memberships.find(
        (m) => m.tenant.slug === tenantSlug,
      );

    if (!membershipForTenant) return null;

    // Flatten TenantPermission objects across all roles
    const allTenantPermissions: TenantPermission[] =
      (membershipForTenant.roles ?? []).flatMap(
        (role: Role) => role.tenant_permissions ?? [],
      );

    // Filter by subject_class + action
    const matchedPerms = allTenantPermissions.filter(
      (tp: TenantPermission) =>
        tp.subject_class === subjectClass &&
        tp.action === action,
    );

    const allAttrsForSubject =
      READ_ATTRIBUTES_BY_SUBJECT[subjectClass] ?? [];

    // No TenantPermission for that subject/action:
    // assume global/full access for this subject.
    if (matchedPerms.length === 0) {
      return allAttrsForSubject;
    }

    // Build union of allow/deny attributes
    const allowUnion = new Set<string>();
    const denyUnion = new Set<string>();

    matchedPerms.forEach((tp: TenantPermission) => {
      (tp.allow_attributes ?? []).forEach((attr) =>
        allowUnion.add(attr),
      );
      (tp.deny_attributes ?? []).forEach((attr) =>
        denyUnion.add(attr),
      );
    });

    const hasAnyAllow = allowUnion.size > 0;
    const hasAnyDeny = denyUnion.size > 0;

    // Case 1: allow[] and deny[] empty across all TenantPermission
    // => full access (all attributes for the subject)
    if (!hasAnyAllow && !hasAnyDeny) {
      return allAttrsForSubject;
    }

    // Case 2: at least one allow_attributes entry => whitelist
    if (hasAnyAllow) {
      return Array.from(allowUnion);
    }

    // Case 3: only deny_attributes => blacklist (full - denied)
    const denied = Array.from(denyUnion);
    return allAttrsForSubject.filter(
      (attr) => !denied.includes(attr),
    );
  };

export default permissionsSlice.reducer;
