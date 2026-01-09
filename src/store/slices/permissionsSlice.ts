'use client';

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type {
  MembershipResponse,
  EffectiveModule,
  Membership,
  Role,
  TenantPermission,
  Tenant,
  Client,
  TenantModule,
  TenantModuleStrategy,
  Permission,
} from '@/types/access-control';
import { fetchUserMembership } from '@/services/userAuthService';
import { buildEffectiveModulesFromMembership } from '@/utils/membershipModules';
import { VEHICLE_READ_ATTRIBUTES } from '@/types/vehicles/api';
import { normalizeApiError } from '@/errors/normalizeApiError';

/**
 * Shape of the error returned when loading memberships/permissions fails.
 * It loosely matches the JSON:API error structure used by the backend.
 */
export type PermissionsError =
  | {
      code: string;
      title: string;
      detail: string;
    }
  | null;

/**
 * Tenant/client info useful for UI chrome (logo, short name, etc.)
 * Kept minimal & serializable.
 */
export type TenantInfo = {
  tenantId: number | null;
  slug: string | null;
  clientId: number | null;
  clientName: string | null;
  clientShortName: string | null;
  countryCode: string | null;
  logoUrl: string | null;
} | null;

/**
 * Strategy resolution rules:
 * - no strategies => default "base"
 * - strategies present => must have 1 default; fallback to "base" if missing
 */
export type TenantModuleResolved = {
  id: number;
  name: string;
  key: string;
  active: boolean;
  defaultStrategyKey: string; // always set (at least "base")
};

/**
 * Normalized tenant modules context (serializable)
 */
export type TenantModulesState = {
  tenantSlugLoaded: string | null;
  tenantInfo: TenantInfo;
  modulesByKey: Record<string, TenantModuleResolved>;
  activeModuleKeys: string[];
};

/**
 * Redux state for permissions and effective modules
 * for the current tenant / membership context.
 */
export type PermissionsState = {
  loading: boolean;
  error: PermissionsError;
  membership: MembershipResponse | null;

  /**
   * NOTE: this list is post-filtered so that "module inactive always wins".
   */
  effectiveModules: EffectiveModule[];

  /**
   * NOTE: this list is filtered so that "module inactive always wins".
   */
  flatPermissions: string[];

  tenantModules: TenantModulesState;
};

/**
 * Initial state of the permissions slice.
 */
const initialState: PermissionsState = {
  loading: false,
  error: null,
  membership: null,
  effectiveModules: [],
  flatPermissions: [],
  tenantModules: {
    tenantSlugLoaded: null,
    tenantInfo: null,
    modulesByKey: {},
    activeModuleKeys: [],
  },
};

function normalizeToken(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function normalizePermissionString(value: string): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const parts = raw
    .split(':')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length !== 2) return null;

  const subject = normalizeToken(parts[0]);
  const action = normalizeToken(parts[1]);

  if (!subject || !action) return null;

  return `${subject}:${action}`;
}

/**
 * We need a stable mapping from permission subject -> tenant module key
 * for cases where we don't have direct app_module.key in permission payload.
 *
 * NOTE: Expand as new subjects/modules are introduced.
 */
const SUBJECT_TO_MODULE_KEY: Record<string, string> = {
  vehicle: 'vehicles',
  catalog: 'catalog',
  trip: 'trips',
  trips: 'trips',
  insight: 'insights',
  insights: 'insights',
  routegroup: 'route_groups',
  routegroups: 'route_groups',
  route_group: 'route_groups',
  route_groups: 'route_groups',
};

function moduleKeyFromSubject(subjectToken: string): string | null {
  const s = normalizeToken(subjectToken);
  if (!s) return null;

  if (SUBJECT_TO_MODULE_KEY[s]) return SUBJECT_TO_MODULE_KEY[s];

  const collapsed = s.replace(/[\s-]+/g, '_');
  if (SUBJECT_TO_MODULE_KEY[collapsed]) return SUBJECT_TO_MODULE_KEY[collapsed];

  return null;
}

function resolveDefaultStrategyKey(strategies: TenantModuleStrategy[] | undefined): string {
  if (!strategies || strategies.length === 0) return 'base';

  const defaultStrategy = strategies.find((s) => s.default === true);
  if (defaultStrategy?.key) return defaultStrategy.key.trim() || 'base';

  if (process.env.NODE_ENV !== 'production') {
     
    console.warn(
      '[permissions] Module has strategies but no default. Falling back to "base".',
    );
  }

  return 'base';
}

function createActiveModuleNameSet(modulesByKey: Record<string, TenantModuleResolved>): Set<string> {
  return new Set(
    Object.values(modulesByKey)
      .filter((m) => m.active)
      .map((m) => normalizeToken(m.name)),
  );
}

/**
 * Build normalized tenant modules context from membershipForTenant.tenant.modules
 * - indexes by module.key
 * - computes defaultStrategyKey (always at least "base")
 */
function buildTenantModulesState(
  tenantSlug: string,
  membershipForTenant: Membership | undefined,
): TenantModulesState {
  const tenant: Tenant | undefined = membershipForTenant?.tenant;
  const client: Client | null | undefined = tenant?.client ?? null;
  const modules: TenantModule[] = tenant?.modules ?? [];

  const modulesByKey: Record<string, TenantModuleResolved> = {};

  for (const mod of modules) {
    const key = String(mod.key ?? '').trim();
    if (!key) continue;

    modulesByKey[key] = {
      id: mod.id,
      name: mod.name,
      key,
      active: Boolean(mod.active),
      defaultStrategyKey: resolveDefaultStrategyKey(mod.strategies),
    };
  }

  const activeModuleKeys = Object.values(modulesByKey)
    .filter((m) => m.active)
    .map((m) => m.key)
    .sort();

  const tenantInfo: TenantInfo = membershipForTenant
    ? {
        tenantId: tenant?.id ?? null,
        slug: tenant?.slug ?? null,
        clientId: client?.id ?? null,
        clientName: client?.name ?? null,
        clientShortName: client?.short_name ?? null,
        countryCode: client?.country_code ?? null,
        logoUrl: client?.logo_url ?? null,
      }
    : null;

  return {
    tenantSlugLoaded: tenantSlug,
    tenantInfo,
    modulesByKey,
    activeModuleKeys,
  };
}

/**
 * Thunk that loads the current user's membership for a given tenant
 * and derives the "effective modules" for that tenant.
 */
export const loadTenantPermissions = createAsyncThunk<
  { membership: MembershipResponse; tenantSlug: string },
  string,
  { rejectValue: NonNullable<PermissionsError> }
>('permissions/loadTenantPermissions', async (tenantSlug: string, thunkAPI) => {
  try {
    const response = await fetchUserMembership(tenantSlug);
    return { membership: response.data, tenantSlug };
  } catch (error) {
    const normalized = normalizeApiError(error, {
      defaultMessage: 'Something went wrong while loading memberships.',
      useAxiosMessageAsFallback: false,
    });

    return thunkAPI.rejectWithValue({
      code: normalized.code ?? 'UNKNOWN_ERROR',
      title: normalized.title ?? 'Dashboard error',
      detail: normalized.detail ?? 'Something went wrong while loading memberships.',
    });
  }
});

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTenantPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loadTenantPermissions.fulfilled,
        (
          state,
          action: PayloadAction<{ membership: MembershipResponse; tenantSlug: string }>,
        ) => {
          state.loading = false;
          state.membership = action.payload.membership;

          const membershipForTenant = action.payload.membership.memberships.find(
            (m) => m.tenant.slug === action.payload.tenantSlug,
          );

          state.tenantModules = buildTenantModulesState(
            action.payload.tenantSlug,
            membershipForTenant,
          );

          const rawEffective: EffectiveModule[] = membershipForTenant
            ? buildEffectiveModulesFromMembership(membershipForTenant)
            : [];

          if (!membershipForTenant) {
            state.effectiveModules = [];
            state.flatPermissions = [];
            return;
          }

          // Filter effectiveModules by active tenant modules (inactive always wins)
          const activeByName = createActiveModuleNameSet(state.tenantModules.modulesByKey);

          state.effectiveModules = rawEffective.filter((m) =>
            activeByName.has(normalizeToken(m.appModuleName)),
          );

          // Derive flat permissions (union across all roles) + enforce inactive wins
          const flat = new Set<string>();
          const activeModuleNameSet = activeByName;

          for (const role of membershipForTenant.roles ?? []) {
            for (const perm of role.permissions ?? []) {
              const p: Permission = perm;

              const subject = normalizeToken(p.subject_class);
              const act = normalizeToken(p.action);
              if (!subject || !act) continue;

              const permModuleName = normalizeToken(p.app_module?.name);
              if (permModuleName && !activeModuleNameSet.has(permModuleName)) {
                continue;
              }

              flat.add(`${subject}:${act}`);
            }
          }

          state.flatPermissions = Array.from(flat).sort();
        },
      )
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
        state.flatPermissions = [];
        state.tenantModules = {
          tenantSlugLoaded: null,
          tenantInfo: null,
          modulesByKey: {},
          activeModuleKeys: [],
        };
      });
  },
});

export const { clearPermissions } = permissionsSlice.actions;

/** ----------------------------
 * Basic selectors
 * --------------------------- */
export const selectPermissionsLoading = (state: RootState) =>
  state.permissions.loading;

export const selectPermissionsError = (state: RootState) =>
  state.permissions.error;

export const selectEffectiveModules = (state: RootState) =>
  state.permissions.effectiveModules;

export const selectMembershipRaw = (state: RootState) =>
  state.permissions.membership;

export const selectFlatPermissions = (state: RootState) =>
  state.permissions.flatPermissions;

/**
 * Tenant context selectors
 */
export const selectTenantInfo = (state: RootState) =>
  state.permissions.tenantModules.tenantInfo;

export const selectTenantModulesByKey = (state: RootState) =>
  state.permissions.tenantModules.modulesByKey;

export const selectActiveTenantModuleKeys = (state: RootState) =>
  state.permissions.tenantModules.activeModuleKeys;

export const selectTenantSlugLoaded = (state: RootState) =>
  state.permissions.tenantModules.tenantSlugLoaded;

/**
 * Readiness for gating:
 * - membership loaded
 * - not loading
 * - tenant context loaded for some slug
 */
export const selectPermissionsReady = (state: RootState) =>
  !state.permissions.loading &&
  state.permissions.membership !== null &&
  state.permissions.tenantModules.tenantSlugLoaded !== null;

export const selectIsModuleActive =
  (moduleKey: string) =>
  (state: RootState): boolean => {
    const key = normalizeToken(moduleKey);
    if (!key) return false;

    return Boolean(state.permissions.tenantModules.modulesByKey[key]?.active);
  };

export const selectDefaultStrategyForModule =
  (moduleKey: string) =>
  (state: RootState): string => {
    const key = normalizeToken(moduleKey);
    if (!key) return 'base';

    return state.permissions.tenantModules.modulesByKey[key]?.defaultStrategyKey || 'base';
  };

export const selectActionsForSubject =
  (subject: string) =>
  (state: RootState): string[] => {
    const modules = state.permissions.effectiveModules;

    const mod = modules.find((m) =>
      Object.prototype.hasOwnProperty.call(m.actionsBySubject, subject),
    );

    return mod?.actionsBySubject?.[subject] ?? [];
  };

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
 * (the "universe" used for allow/deny computation).
 */
const READ_ATTRIBUTES_BY_SUBJECT: Record<string, string[]> = {
  vehicle: VEHICLE_READ_ATTRIBUTES as string[],
};

const SUBJECT_READS_MODULE_KEY: Record<string, string> = {
  vehicle: 'vehicles',
};

export const selectAllowedAttributesForSubjectAndAction =
  (tenantSlug: string | null, subjectClass: string, action: string) =>
  (state: RootState): string[] | null => {
    if (!tenantSlug) return null;

    const membership: MembershipResponse | null = state.permissions.membership;
    if (!membership) return null;

    const membershipForTenant: Membership | undefined = membership.memberships.find(
      (m) => m.tenant.slug === tenantSlug,
    );
    if (!membershipForTenant) return null;

    const normalizedSubject = normalizeToken(subjectClass);
    const normalizedAction = normalizeToken(action);

    const moduleKey =
      SUBJECT_READS_MODULE_KEY[normalizedSubject] ?? moduleKeyFromSubject(normalizedSubject);

    if (moduleKey) {
      const mod = state.permissions.tenantModules.modulesByKey[moduleKey];
      if (mod && mod.active === false) return [];
    }

    const allAttrsForSubject = READ_ATTRIBUTES_BY_SUBJECT[normalizedSubject] ?? [];

    const allTenantPermissions: TenantPermission[] = (membershipForTenant.roles ?? []).flatMap(
      (role: Role) => role.tenant_permissions ?? [],
    );

    const matchedPerms = allTenantPermissions.filter((tp) => {
      const tpSubject = normalizeToken(tp.subject_class);
      const tpAction = normalizeToken(tp.action);
      return tpSubject === normalizedSubject && tpAction === normalizedAction;
    });

    // Default allow-all remains
    if (matchedPerms.length === 0) {
      return allAttrsForSubject;
    }

    const allowUnion = new Set<string>();
    const denyUnion = new Set<string>();

    matchedPerms.forEach((tp) => {
      (tp.allow_attributes ?? []).forEach((attr) => allowUnion.add(attr));
      (tp.deny_attributes ?? []).forEach((attr) => denyUnion.add(attr));
    });

    const hasAnyAllow = allowUnion.size > 0;
    const hasAnyDeny = denyUnion.size > 0;

    if (!hasAnyAllow && !hasAnyDeny) return allAttrsForSubject;
    if (hasAnyAllow) return Array.from(allowUnion);

    const denied = denyUnion;
    return allAttrsForSubject.filter((attr) => !denied.has(attr));
  };

export const selectFlatPermissionsSet = createSelector(
  [selectFlatPermissions],
  (perms) => new Set(perms),
);

export const selectHasPermission =
  (permission: string) =>
  (state: RootState): boolean => {
    if (!selectPermissionsReady(state)) return false;

    const normalized = normalizePermissionString(permission);
    if (!normalized) {
      if (process.env.NODE_ENV !== 'production') {
         
        console.warn(`[permissions] Invalid permission string: "${permission}"`);
      }
      return false;
    }

    const [subject] = normalized.split(':');

    const moduleKey =
      SUBJECT_TO_MODULE_KEY[subject] ?? moduleKeyFromSubject(subject);

    if (moduleKey) {
      const mod = state.permissions.tenantModules.modulesByKey[moduleKey];
      if (mod && mod.active === false) return false;
    }

    return selectFlatPermissionsSet(state).has(normalized);
  };

export default permissionsSlice.reducer;
