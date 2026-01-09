import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import type { AxiosError } from 'axios';

import type {
  MembershipResponse,
  Membership,
  Role,
  Tenant,
  Client,
  TenantPermission,
  EffectiveModule,
} from '@/types/access-control';
import type { RootState } from '@/store/store';

vi.mock('@/services/userAuthService', () => ({
  fetchUserMembership: vi.fn(),
}));

vi.mock('@/utils/membershipModules', () => ({
  buildEffectiveModulesFromMembership: vi.fn(),
}));

vi.mock('@/types/vehicles/api', () => ({
  VEHICLE_READ_ATTRIBUTES: ['plate', 'model_year', 'status'],
}));

import {
  permissionsSlice,
  clearPermissions,
  loadTenantPermissions,
  selectPermissionsLoading,
  selectPermissionsError,
  selectEffectiveModules,
  selectMembershipRaw,
  selectActionsForSubject,
  selectModuleByKey,
  selectAllowedAttributesForSubjectAndAction,
  selectFlatPermissions,
  selectPermissionsReady,
  selectHasPermission,
  type PermissionsState,
  type PermissionsError,
} from '@/store/slices/permissionsSlice';
import { fetchUserMembership } from '@/services/userAuthService';
import { buildEffectiveModulesFromMembership } from '@/utils/membershipModules';
import type { TenantModuleResolved } from '@/store/slices/permissionsSlice';

const fetchUserMembershipMock = fetchUserMembership as unknown as Mock;
const buildEffectiveModulesFromMembershipMock =
  buildEffectiveModulesFromMembership as unknown as Mock;

const TENANT_SLUG = 'coolitoral';
const OTHER_TENANT_SLUG = 'other';

type TenantModulesState = PermissionsState['tenantModules'];

function buildRootState(permissions: PermissionsState): RootState {
  return { permissions } as unknown as RootState;
}

function createResolvedModule(
  overrides: Partial<TenantModuleResolved> = {},
): TenantModuleResolved {
  return {
    id: 1,
    key: 'vehicles',
    name: 'Vehicles',
    active: true,
    defaultStrategyKey: 'default',
    ...overrides,
  };
}

function createTenantModulesState(
  partial: Partial<TenantModulesState> = {},
): TenantModulesState {
  const base: TenantModulesState = {
    activeModuleKeys: [],
    modulesByKey: {},
    tenantInfo: null,
    tenantSlugLoaded: null,
  } as TenantModulesState;

  return {
    ...base,
    ...partial,
  };
}

function createPermissionsState(
  partial: Partial<PermissionsState> = {},
): PermissionsState {
  const base: PermissionsState = {
    loading: false,
    error: null,
    membership: null,
    effectiveModules: [],
    flatPermissions: [],
    tenantModules: createTenantModulesState(),
  } as PermissionsState;

  return {
    ...base,
    ...partial,
    tenantModules: createTenantModulesState(partial.tenantModules),
  };
}

function createClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    name: 'Coolitoral',
    short_name: 'Coolitoral',
    country_code: 'CO',
    logo_url: '',
    ...overrides,
  } as Client;
}

function createTenant(overrides: Partial<Tenant> = {}): Tenant {
  const clientOverrides =
    overrides.client && overrides.client !== null ? overrides.client : undefined;

  return {
    id: 1,
    slug: 'coolitoral',
    modules: [
      {
        key: 'vehicles',
        name: 'Vehicles',
        active: true,
      },
    ],
    ...overrides,
    client: createClient(clientOverrides),
  } as Tenant;
}

function createMembershipForTenant(
  tenantSlug: string,
  overrides: Partial<Membership> = {},
): Membership {
  return {
    id: 1,
    active: true,
    tenant: createTenant({ slug: tenantSlug }),
    roles: [] as Role[],
    permissions: [],
    ...overrides,
  } as unknown as Membership;
}

function createMembershipResponse(
  memberships: Membership[] = [],
  overrides: Partial<MembershipResponse> = {},
): MembershipResponse {
  return {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone: null,
    memberships,
    ...overrides,
  } as unknown as MembershipResponse;
}

const fakeEffectiveModules: EffectiveModule[] = [
  {
    appModuleName: 'Vehicles',
    appModuleKey: 'vehicles',
    actionsBySubject: {
      Vehicle: ['read', 'update'],
      Route: ['read'],
    },
  },
] as unknown as EffectiveModule[];

function fulfilledAction(params: { membership: MembershipResponse; tenantSlug: string }) {
  return loadTenantPermissions.fulfilled(params, 'req-fulfilled', params.tenantSlug);
}

describe('permissionsSlice reducer', () => {
  const reducer = permissionsSlice.reducer;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state when called with undefined state', () => {
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state).toEqual(
      createPermissionsState({
        tenantModules: createTenantModulesState(),
      }),
    );
  });

  it('clearPermissions resets state to initialState', () => {
    const vehiclesModule = createResolvedModule();

    const prev = createPermissionsState({
      loading: true,
      error: { code: 'X', title: 'T', detail: 'D' },
      membership: {} as MembershipResponse,
      effectiveModules:
        fakeEffectiveModules as ReturnType<typeof buildEffectiveModulesFromMembership>,
      flatPermissions: ['vehicle:read'],
      tenantModules: createTenantModulesState({
        tenantSlugLoaded: TENANT_SLUG,
        activeModuleKeys: ['vehicles'],
        modulesByKey: {
        [vehiclesModule.key]: vehiclesModule,
      },
      }),
    });

    const next = reducer(prev, clearPermissions());

    expect(next).toEqual(createPermissionsState());
  });

  it('handles loadTenantPermissions.pending: sets loading true and clears error', () => {
    const prev = createPermissionsState({
      error: { code: 'OLD', title: 'Old', detail: 'Old detail' },
    });

    const action = loadTenantPermissions.pending('req-1', TENANT_SLUG);
    const next = reducer(prev, action);

    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles loadTenantPermissions.fulfilled: stores membership and effectiveModules for tenant', () => {
    const membershipResponse = createMembershipResponse([
      createMembershipForTenant(OTHER_TENANT_SLUG, {
        tenant: createTenant({ slug: OTHER_TENANT_SLUG, id: 10 }),
      }),
      createMembershipForTenant(TENANT_SLUG, {
        tenant: createTenant({ slug: TENANT_SLUG, id: 20 }),
      }),
    ]);

    buildEffectiveModulesFromMembershipMock.mockReturnValue(fakeEffectiveModules);

    const action = fulfilledAction({ membership: membershipResponse, tenantSlug: TENANT_SLUG });
    const prev = createPermissionsState({ loading: true });
    const next = reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.membership).toBe(membershipResponse);

    expect(buildEffectiveModulesFromMembershipMock).toHaveBeenCalledTimes(1);
    expect(buildEffectiveModulesFromMembershipMock).toHaveBeenCalledWith(
      membershipResponse.memberships[1],
    );

    expect(next.effectiveModules).toEqual(fakeEffectiveModules);
    expect(next.tenantModules.tenantSlugLoaded).toBe(TENANT_SLUG);
  });

  it('handles loadTenantPermissions.fulfilled: sets empty effectiveModules when tenant membership is missing', () => {
    const membershipResponse = createMembershipResponse([
      createMembershipForTenant(OTHER_TENANT_SLUG, {
        tenant: createTenant({ slug: OTHER_TENANT_SLUG, id: 10 }),
      }),
    ]);

    const action = fulfilledAction({ membership: membershipResponse, tenantSlug: TENANT_SLUG });
    const prev = createPermissionsState({ loading: true });
    const next = reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.membership).toBe(membershipResponse);

    expect(buildEffectiveModulesFromMembershipMock).not.toHaveBeenCalled();
    expect(next.effectiveModules).toEqual([]);
    expect(next.flatPermissions).toEqual([]);
    expect(next.tenantModules.tenantSlugLoaded).toBe(TENANT_SLUG);
  });

  it('handles loadTenantPermissions.rejected with payload: stores structured error and resets membership', () => {
    const errorPayload: NonNullable<PermissionsError> = {
      code: 'PERM_DENIED',
      title: 'Forbidden',
      detail: 'You are not allowed',
    };

    const action = loadTenantPermissions.rejected(
      new Error('boom'),
      'req-4',
      TENANT_SLUG,
      errorPayload,
    );

    const vehiclesModule = createResolvedModule();

    const prev = createPermissionsState({
      loading: true,
      membership: {} as MembershipResponse,
      effectiveModules: fakeEffectiveModules,
      flatPermissions: ['vehicle:read'],
      tenantModules: createTenantModulesState({
        tenantSlugLoaded: TENANT_SLUG,
        activeModuleKeys: ['vehicles'],
        modulesByKey: {
          [vehiclesModule.key]: vehiclesModule,
        },
      }),
    });

    const next = reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.error).toEqual(errorPayload);
    expect(next.membership).toBeNull();
    expect(next.effectiveModules).toEqual([]);
    expect(next.flatPermissions).toEqual([]);
  });

  it('handles loadTenantPermissions.rejected without payload: sets default UNKNOWN_ERROR', () => {
    const action = loadTenantPermissions.rejected(
      new Error('network'),
      'req-5',
      TENANT_SLUG,
      undefined,
    );

    const prev = createPermissionsState({
      loading: true,
      membership: {} as MembershipResponse,
      tenantModules: createTenantModulesState({ tenantSlugLoaded: TENANT_SLUG }),
    });

    const next = reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.error).toEqual({
      code: 'UNKNOWN_ERROR',
      title: 'Dashboard error',
      detail: 'Unknown error while loading memberships.',
    });
    expect(next.membership).toBeNull();
    expect(next.effectiveModules).toEqual([]);
    expect(next.flatPermissions).toEqual([]);
  });
});

describe('loadTenantPermissions thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches fulfilled with membership and tenantSlug on success', async () => {
    const membershipResponse: MembershipResponse = createMembershipResponse([]);

    fetchUserMembershipMock.mockResolvedValue({ data: membershipResponse });

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = loadTenantPermissions(TENANT_SLUG);
    const result = await thunk(dispatch, getState, undefined);

    expect(fetchUserMembershipMock).toHaveBeenCalledWith(TENANT_SLUG);
    expect(result.type).toBe('permissions/loadTenantPermissions/fulfilled');
    expect(result.payload).toEqual({ membership: membershipResponse, tenantSlug: TENANT_SLUG });
  });

  it('dispatches rejected with structured error when API returns JSON:API error', async () => {
    const axiosError = {
      response: {
        data: {
          errors: [
            {
              code: 'PERM_DENIED',
              title: 'Forbidden',
              detail: 'You cannot access this tenant',
            },
          ],
        },
      },
    } as AxiosError;

    fetchUserMembershipMock.mockRejectedValue(axiosError);

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = loadTenantPermissions(TENANT_SLUG);
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('permissions/loadTenantPermissions/rejected');
    expect(result.payload).toEqual({
      code: 'PERM_DENIED',
      title: 'Forbidden',
      detail: 'You cannot access this tenant',
    });
  });

  it('dispatches rejected with fallback UNKNOWN_ERROR when error response is missing', async () => {
    fetchUserMembershipMock.mockRejectedValue(new Error('Network down'));

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = loadTenantPermissions(TENANT_SLUG);
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('permissions/loadTenantPermissions/rejected');
    expect(result.payload).toEqual({
      code: 'UNKNOWN_ERROR',
      title: 'Dashboard error',
      detail: 'Something went wrong while loading memberships.',
    });
  });
});

describe('permissions selectors (basic)', () => {
  it('selectPermissionsLoading returns loading flag', () => {
    const state = buildRootState(createPermissionsState({ loading: true }));
    expect(selectPermissionsLoading(state)).toBe(true);
  });

  it('selectPermissionsError returns error object or null', () => {
    const err: NonNullable<PermissionsError> = { code: 'E1', title: 'Error', detail: 'Detail' };
    const state = buildRootState(createPermissionsState({ error: err }));
    expect(selectPermissionsError(state)).toEqual(err);
  });

  it('selectEffectiveModules returns effectiveModules array', () => {
    const state = buildRootState(createPermissionsState({ effectiveModules: fakeEffectiveModules }));
    expect(selectEffectiveModules(state)).toBe(fakeEffectiveModules);
  });

  it('selectMembershipRaw returns raw membership or null', () => {
    const membership = createMembershipResponse([]);
    const state = buildRootState(createPermissionsState({ membership }));
    expect(selectMembershipRaw(state)).toBe(membership);
  });
});

describe('selectActionsForSubject', () => {
  it('returns actions for subject when present in effectiveModules', () => {
    const state = buildRootState(createPermissionsState({ effectiveModules: fakeEffectiveModules }));
    expect(selectActionsForSubject('Vehicle')(state)).toEqual(['read', 'update']);
  });

  it('returns empty array when subject is not present', () => {
    const state = buildRootState(createPermissionsState({ effectiveModules: fakeEffectiveModules }));
    expect(selectActionsForSubject('Unknown')(state)).toEqual([]);
  });

  it('handles empty effectiveModules gracefully', () => {
    const state = buildRootState(createPermissionsState());
    expect(selectActionsForSubject('Vehicle')(state)).toEqual([]);
  });
});

describe('selectModuleByKey', () => {
  it('returns matching module by name case-insensitively', () => {
    const state = buildRootState(createPermissionsState({ effectiveModules: fakeEffectiveModules }));
    expect(selectModuleByKey('vehicles')(state)).toBe(fakeEffectiveModules[0]);
    expect(selectModuleByKey('VeHiClEs')(state)).toBe(fakeEffectiveModules[0]);
  });

  it('returns undefined when module is not found', () => {
    const state = buildRootState(createPermissionsState({ effectiveModules: fakeEffectiveModules }));
    expect(selectModuleByKey('reports')(state)).toBeUndefined();
  });

  it('handles empty effectiveModules gracefully', () => {
    const state = buildRootState(createPermissionsState());
    expect(selectModuleByKey('vehicles')(state)).toBeUndefined();
  });
});

describe('selectAllowedAttributesForSubjectAndAction', () => {
  const ALL_VEHICLE_ATTRS = ['plate', 'model_year', 'status'];

  function stateWithTenantLoaded(membership: MembershipResponse | null) {
    const vehiclesModule = createResolvedModule();
    return buildRootState(
      createPermissionsState({
        membership,
        tenantModules: createTenantModulesState({
          tenantSlugLoaded: TENANT_SLUG,
          activeModuleKeys: ['vehicles'],
          modulesByKey: {
            [vehiclesModule.key]: vehiclesModule,
          },
        }),
      }),
    );
  }

  it('returns null when tenantSlug is null', () => {
    const state = buildRootState(createPermissionsState());
    expect(selectAllowedAttributesForSubjectAndAction(null, 'vehicle', 'read')(state)).toBeNull();
  });

  it('returns null when membership is null', () => {
    const state = buildRootState(createPermissionsState());
    expect(
      selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state),
    ).toBeNull();
  });

  it('returns null when tenant membership is missing', () => {
    const membership = createMembershipResponse([createMembershipForTenant(OTHER_TENANT_SLUG)]);
    const state = stateWithTenantLoaded(membership);

    expect(selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state)).toBeNull();
  });

  it('returns full attribute list when there is no TenantPermission for subject/action', () => {
    const membership = createMembershipResponse([createMembershipForTenant(TENANT_SLUG, { roles: [] })]);
    const state = stateWithTenantLoaded(membership);

    expect(selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state)).toEqual(
      ALL_VEHICLE_ATTRS,
    );
  });

  it('returns full attribute list when allow[] and deny[] are empty for all matched permissions', () => {
    const tenantPerm: TenantPermission = {
      id: 1,
      subject_class: 'vehicle',
      action: 'read',
      allow_attributes: [],
      deny_attributes: [],
    } as unknown as TenantPermission;

    const role: Role = {
      id: 1,
      name: 'Manager',
      key: 'manager',
      tenant_permissions: [tenantPerm],
      permissions: [],
    } as unknown as Role;

    const membership = createMembershipResponse([
      createMembershipForTenant(TENANT_SLUG, { roles: [role] }),
    ]);
    const state = stateWithTenantLoaded(membership);

    expect(selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state)).toEqual(
      ALL_VEHICLE_ATTRS,
    );
  });

  it('returns union of allow_attributes when present (whitelist behaviour)', () => {
    const perm1: TenantPermission = {
      id: 1,
      subject_class: 'vehicle',
      action: 'read',
      allow_attributes: ['plate'],
      deny_attributes: [],
    } as unknown as TenantPermission;

    const perm2: TenantPermission = {
      id: 2,
      subject_class: 'vehicle',
      action: 'read',
      allow_attributes: ['status'],
      deny_attributes: [],
    } as unknown as TenantPermission;

    const role1: Role = {
      id: 1,
      name: 'Role1',
      key: 'role1',
      tenant_permissions: [perm1],
      permissions: [],
    } as unknown as Role;

    const role2: Role = {
      id: 2,
      name: 'Role2',
      key: 'role2',
      tenant_permissions: [perm2],
      permissions: [],
    } as unknown as Role;

    const membership = createMembershipResponse([
      createMembershipForTenant(TENANT_SLUG, { roles: [role1, role2] }),
    ]);
    const state = stateWithTenantLoaded(membership);

    const result = selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state);
    expect(result!.sort()).toEqual(['plate', 'status'].sort());
  });

  it('returns full minus denied when only deny_attributes are present (blacklist behaviour)', () => {
    const perm1: TenantPermission = {
      id: 1,
      subject_class: 'vehicle',
      action: 'read',
      allow_attributes: [],
      deny_attributes: ['status'],
    } as unknown as TenantPermission;

    const role: Role = {
      id: 1,
      name: 'Role1',
      key: 'role1',
      tenant_permissions: [perm1],
      permissions: [],
    } as unknown as Role;

    const membership = createMembershipResponse([
      createMembershipForTenant(TENANT_SLUG, { roles: [role] }),
    ]);
    const state = stateWithTenantLoaded(membership);

    expect(selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state)).toEqual(
      ['plate', 'model_year'],
    );
  });

  it('returns empty list when subjectClass has no configured attributes and no permissions', () => {
    const membership = createMembershipResponse([
      createMembershipForTenant(TENANT_SLUG, { roles: [] }),
    ]);
    const state = stateWithTenantLoaded(membership);

    expect(
      selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'unknown_subject', 'read')(state),
    ).toEqual([]);
  });

  it('ignores TenantPermissions for other subject/action combinations', () => {
    const perm1: TenantPermission = {
      id: 1,
      subject_class: 'vehicle',
      action: 'update',
      allow_attributes: ['status'],
      deny_attributes: [],
    } as unknown as TenantPermission;

    const role: Role = {
      id: 1,
      name: 'Role1',
      key: 'role1',
      tenant_permissions: [perm1],
      permissions: [],
    } as unknown as Role;

    const membership = createMembershipResponse([
      createMembershipForTenant(TENANT_SLUG, { roles: [role] }),
    ]);
    const state = stateWithTenantLoaded(membership);

    expect(selectAllowedAttributesForSubjectAndAction(TENANT_SLUG, 'vehicle', 'read')(state)).toEqual(
      ALL_VEHICLE_ATTRS,
    );
  });
});

describe('flatPermissions derivation', () => {
  it('derives unique, normalized flat permissions from roles', () => {
    const membershipForTenant: Membership = createMembershipForTenant(TENANT_SLUG, {
      roles: [
        {
          id: 1,
          name: 'Manager',
          key: 'manager',
          tenant_permissions: [],
          permissions: [
            { id: 1, subject_class: 'Vehicle', action: 'READ', app_module: { id: 1, name: 'Vehicles', active: true } },
            { id: 2, subject_class: 'vehicle', action: 'stats', app_module: { id: 1, name: 'Vehicles', active: true } },
            // duplicate (should be deduped)
            { id: 3, subject_class: 'VEHICLE', action: 'read', app_module: { id: 1, name: 'Vehicles', active: true } },
          ],
        } as unknown as Role,
      ],
    });

    const membershipResponse = createMembershipResponse([membershipForTenant]);

    buildEffectiveModulesFromMembershipMock.mockReturnValue([]);

    const action = fulfilledAction({ membership: membershipResponse, tenantSlug: TENANT_SLUG });

    const state = permissionsSlice.reducer(createPermissionsState({ loading: true }), action);

    expect(state.flatPermissions).toEqual(['vehicle:read', 'vehicle:stats']);
  });

  it('sets flatPermissions to empty when tenant membership is missing', () => {
    const membershipResponse = createMembershipResponse([]);

    const action = fulfilledAction({ membership: membershipResponse, tenantSlug: TENANT_SLUG });

    const state = permissionsSlice.reducer(createPermissionsState({ loading: true }), action);

    expect(state.flatPermissions).toEqual([]);
  });
});

describe('flat permissions selectors', () => {
  it('selectFlatPermissions returns flatPermissions array', () => {
    const state = buildRootState(createPermissionsState({ flatPermissions: ['vehicle:read'] }));
    expect(selectFlatPermissions(state)).toEqual(['vehicle:read']);
  });

  it('selectPermissionsReady is false while loading', () => {
    const state = buildRootState(
      createPermissionsState({
        loading: true,
        membership: null,
        tenantModules: createTenantModulesState(),
      }),
    );

    expect(selectPermissionsReady(state)).toBe(false);
  });

  it('selectPermissionsReady is true when membership loaded and tenant slug is loaded', () => {
    const state = buildRootState(
      createPermissionsState({
        loading: false,
        membership: createMembershipResponse([]),
        tenantModules: createTenantModulesState({ tenantSlugLoaded: TENANT_SLUG }),
      }),
    );

    expect(selectPermissionsReady(state)).toBe(true);
  });
});

describe('selectHasPermission', () => {
  function baseState(overrides: Partial<PermissionsState> = {}) {
    return buildRootState(
      createPermissionsState({
        tenantModules: createTenantModulesState({ tenantSlugLoaded: TENANT_SLUG }),
        ...overrides,
      }),
    );
  }

  it('returns false while permissions are loading', () => {
    const state = baseState({ loading: true, flatPermissions: ['vehicle:read'] });
    expect(selectHasPermission('vehicle:read')(state)).toBe(false);
  });

  it('returns false when membership is null', () => {
    const state = baseState({ membership: null, flatPermissions: ['vehicle:read'] });
    expect(selectHasPermission('vehicle:read')(state)).toBe(false);
  });

  it('returns true for existing permission (case-insensitive)', () => {
    const state = baseState({
      membership: createMembershipResponse([]),
      flatPermissions: ['vehicle:read'],
    });

    expect(selectHasPermission('Vehicle:READ')(state)).toBe(true);
  });

  it('returns false for missing permission', () => {
    const state = baseState({
      membership: createMembershipResponse([]),
      flatPermissions: ['vehicle:read'],
    });

    expect(selectHasPermission('vehicle:stats')(state)).toBe(false);
  });

  it('returns false for invalid permission strings', () => {
    const state = baseState({
      membership: createMembershipResponse([]),
      flatPermissions: ['vehicle:read'],
    });

    expect(selectHasPermission('')(state)).toBe(false);
    expect(selectHasPermission('vehicle')(state)).toBe(false);
    expect(selectHasPermission('vehicle:')(state)).toBe(false);
    expect(selectHasPermission(':read')(state)).toBe(false);
  });
});
