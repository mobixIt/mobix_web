import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

import type { AxiosError } from 'axios';
import type {
  MembershipResponse,
  Membership,
  Role,
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

const fetchUserMembershipMock = fetchUserMembership as unknown as Mock;
const buildEffectiveModulesFromMembershipMock =
  buildEffectiveModulesFromMembership as unknown as Mock;

function buildRootState(permissions: PermissionsState): RootState {
  return {
    permissions,
  } as unknown as RootState;
}

function createInitialPermissionsState(
  partial: Partial<PermissionsState> = {},
): PermissionsState {
  return {
    loading: false,
    error: null,
    membership: null,
    effectiveModules: [],
    flatPermissions: [],
    ...partial,
  };
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

describe('permissionsSlice reducer', () => {
  const reducer = permissionsSlice.reducer;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state when called with undefined state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
      loading: false,
      error: null,
      membership: null,
      effectiveModules: [],
      flatPermissions: [],
    });
  });

  it('clearPermissions resets state to initialState', () => {
    const prev: PermissionsState = createInitialPermissionsState({
      loading: true,
      error: { code: 'X', title: 'T', detail: 'D' },
      membership: {} as MembershipResponse,
      effectiveModules: fakeEffectiveModules as ReturnType<typeof buildEffectiveModulesFromMembership>,
    });

    const next = reducer(prev, clearPermissions());
    expect(next).toEqual({
      loading: false,
      error: null,
      membership: null,
      effectiveModules: [],
      flatPermissions: [],
    });
  });

  it('handles loadTenantPermissions.pending: sets loading true and clears error', () => {
    const prev: PermissionsState = createInitialPermissionsState({
      error: { code: 'OLD', title: 'Old', detail: 'Old detail' },
    });

    const action = loadTenantPermissions.pending('req-1', 'coolitoral');
    const next = reducer(prev, action);

    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles loadTenantPermissions.fulfilled: stores membership and effectiveModules for tenant', () => {
    const membershipResponse: MembershipResponse = {
      memberships: [
        {
          id: 1,
          active: true,
          tenant: { id: 10, slug: 'other', client: { name: 'Other', logo_url: '' } },
          roles: [] as Role[],
          permissions: [],
        } as unknown as Membership,
        {
          id: 2,
          active: true,
          tenant: { id: 20, slug: 'coolitoral', client: { name: 'Coolitoral', logo_url: '' } },
          roles: [] as Role[],
          permissions: [],
        } as unknown as Membership,
      ],
    } as MembershipResponse;

    buildEffectiveModulesFromMembershipMock.mockReturnValue(fakeEffectiveModules);

    const action = loadTenantPermissions.fulfilled(
      { membership: membershipResponse, tenantSlug: 'coolitoral' },
      'req-2',
      'coolitoral',
    );

    const prev = createInitialPermissionsState({ loading: true });
    const next = reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.membership).toBe(membershipResponse);
    expect(buildEffectiveModulesFromMembershipMock).toHaveBeenCalledTimes(1);
    expect(buildEffectiveModulesFromMembershipMock).toHaveBeenCalledWith(
      membershipResponse.memberships[1],
    );
    expect(next.effectiveModules).toEqual(fakeEffectiveModules);
  });

  it('handles loadTenantPermissions.fulfilled: sets empty effectiveModules when tenant membership is missing', () => {
    const membershipResponse: MembershipResponse = {
      memberships: [
        {
          id: 1,
          active: true,
          tenant: { id: 10, slug: 'other', client: { name: 'Other', logo_url: '' } },
          roles: [] as Role[],
          permissions: [],
        } as unknown as Membership,
      ],
    } as MembershipResponse;

    const action = loadTenantPermissions.fulfilled(
      { membership: membershipResponse, tenantSlug: 'coolitoral' },
      'req-3',
      'coolitoral',
    );

    const prev = createInitialPermissionsState({ loading: true });
    const next = permissionsSlice.reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.membership).toBe(membershipResponse);
    expect(buildEffectiveModulesFromMembershipMock).not.toHaveBeenCalled();
    expect(next.effectiveModules).toEqual([]);
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
      'coolitoral',
      errorPayload,
    );

    const prev: PermissionsState = createInitialPermissionsState({
      loading: true,
      membership: {} as MembershipResponse,
      effectiveModules: fakeEffectiveModules,
    });

    const next = reducer(prev, action);

    expect(next.loading).toBe(false);
    expect(next.error).toEqual(errorPayload);
    expect(next.membership).toBeNull();
    expect(next.effectiveModules).toEqual([]);
  });

  it('handles loadTenantPermissions.rejected without payload: sets default UNKNOWN_ERROR', () => {
    const action = loadTenantPermissions.rejected(
      new Error('network'),
      'req-5',
      'coolitoral',
      undefined,
    );

    const prev: PermissionsState = createInitialPermissionsState({
      loading: true,
      membership: {} as MembershipResponse,
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
  });
});

describe('loadTenantPermissions thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches fulfilled with membership and tenantSlug on success', async () => {

    const membershipResponse: MembershipResponse = {
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: null,
      memberships: [],
    };

    fetchUserMembershipMock.mockResolvedValue({
      data: membershipResponse,
    });

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = loadTenantPermissions('coolitoral');
    const result = await thunk(dispatch, getState, undefined);

    expect(fetchUserMembershipMock).toHaveBeenCalledWith('coolitoral');
    expect(result.type).toBe('permissions/loadTenantPermissions/fulfilled');
    expect(result.payload).toEqual({
      membership: membershipResponse,
      tenantSlug: 'coolitoral',
    });
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

    const thunk = loadTenantPermissions('coolitoral');
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

    const thunk = loadTenantPermissions('coolitoral');
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
    const state = buildRootState(
      createInitialPermissionsState({ loading: true }),
    );

    expect(selectPermissionsLoading(state)).toBe(true);
  });

  it('selectPermissionsError returns error object or null', () => {
    const err: NonNullable<PermissionsError> = {
      code: 'E1',
      title: 'Error',
      detail: 'Detail',
    };

    const state = buildRootState(
      createInitialPermissionsState({ error: err }),
    );

    expect(selectPermissionsError(state)).toEqual(err);
  });

  it('selectEffectiveModules returns effectiveModules array', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        effectiveModules: fakeEffectiveModules,
      }),
    );

    expect(selectEffectiveModules(state)).toBe(fakeEffectiveModules);
  });

  it('selectMembershipRaw returns raw membership or null', () => {
    const membership: MembershipResponse = {
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: null,
      memberships: [],
    };

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    expect(selectMembershipRaw(state)).toBe(membership);
  });
});

describe('selectActionsForSubject', () => {
  it('returns actions for subject when present in effectiveModules', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        effectiveModules: fakeEffectiveModules,
      }),
    );

    const selectVehicleActions = selectActionsForSubject('Vehicle');
    expect(selectVehicleActions(state)).toEqual(['read', 'update']);
  });

  it('returns empty array when subject is not present', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        effectiveModules: fakeEffectiveModules,
      }),
    );

    const selectUnknownActions = selectActionsForSubject('Unknown');
    expect(selectUnknownActions(state)).toEqual([]);
  });

  it('handles empty effectiveModules gracefully', () => {
    const state = buildRootState(createInitialPermissionsState());

    const selectVehicleActions = selectActionsForSubject('Vehicle');
    expect(selectVehicleActions(state)).toEqual([]);
  });
});

describe('selectModuleByKey', () => {
  it('returns matching module by name case-insensitively', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        effectiveModules: fakeEffectiveModules,
      }),
    );

    const selectVehiclesModule = selectModuleByKey('vehicles');
    const selectVEHICLESModule = selectModuleByKey('VeHiClEs');

    expect(selectVehiclesModule(state)).toBe(fakeEffectiveModules[0]);
    expect(selectVEHICLESModule(state)).toBe(fakeEffectiveModules[0]);
  });

  it('returns undefined when module is not found', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        effectiveModules: fakeEffectiveModules,
      }),
    );

    const selectUnknownModule = selectModuleByKey('reports');
    expect(selectUnknownModule(state)).toBeUndefined();
  });

  it('handles empty effectiveModules gracefully', () => {
    const state = buildRootState(createInitialPermissionsState());

    const selectVehiclesModule = selectModuleByKey('vehicles');
    expect(selectVehiclesModule(state)).toBeUndefined();
  });
});

describe('selectAllowedAttributesForSubjectAndAction', () => {
  const ALL_VEHICLE_ATTRS = ['plate', 'model_year', 'status'];

  it('returns null when tenantSlug is null', () => {
    const state = buildRootState(createInitialPermissionsState());

    const selector = selectAllowedAttributesForSubjectAndAction(
      null,
      'vehicle',
      'read',
    );

    expect(selector(state)).toBeNull();
  });

  it('returns null when membership is null', () => {
    const state = buildRootState(createInitialPermissionsState());

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    expect(selector(state)).toBeNull();
  });

  it('returns null when tenant membership is missing', () => {
    const membership: MembershipResponse = {
      memberships: [
        {
          id: 1,
          active: true,
          tenant: { id: 10, slug: 'other', client: { name: 'Other', logo_url: '' } },
          roles: [] as Role[],
          permissions: [],
        } as unknown as Membership,
      ],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    expect(selector(state)).toBeNull();
  });

  it('returns full attribute list when there is no TenantPermission for subject/action', () => {
    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [] as Role[],
      permissions: [],
    } as unknown as Membership;

    const membership: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    expect(selector(state)).toEqual(ALL_VEHICLE_ATTRS);
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

    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [role],
      permissions: [],
    } as unknown as Membership;

    const membership: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    expect(selector(state)).toEqual(ALL_VEHICLE_ATTRS);
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

    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [role1, role2],
      permissions: [],
    } as unknown as Membership;

    const membership: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    const result = selector(state);
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

    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [role],
      permissions: [],
    } as unknown as Membership;

    const membership: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    expect(selector(state)).toEqual(['plate', 'model_year']);
  });

  it('returns empty list when subjectClass has no configured attributes and no permissions', () => {
    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [],
      permissions: [],
    } as unknown as Membership;

    const membership: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'unknown_subject',
      'read',
    );

    expect(selector(state)).toEqual([]);
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

    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [role],
      permissions: [],
    } as unknown as Membership;

    const membership: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    const state = buildRootState(
      createInitialPermissionsState({ membership }),
    );

    const selector = selectAllowedAttributesForSubjectAndAction(
      'coolitoral',
      'vehicle',
      'read',
    );

    expect(selector(state)).toEqual(ALL_VEHICLE_ATTRS);
  });
});

describe('flatPermissions derivation', () => {
  it('derives unique, normalized flat permissions from roles', () => {
    const membershipForTenant: Membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [
        {
          id: 1,
          name: 'Manager',
          key: 'manager',
          tenant_permissions: [],
          permissions: [
            {
              id: 1,
              subject_class: 'Vehicle',
              action: 'READ',
              app_module: { id: 1, name: 'Vehicles', active: true },
            },
            {
              id: 2,
              subject_class: 'vehicle',
              action: 'stats',
              app_module: { id: 1, name: 'Vehicles', active: true },
            },
            // duplicate (should be deduped)
            {
              id: 3,
              subject_class: 'VEHICLE',
              action: 'read',
              app_module: { id: 1, name: 'Vehicles', active: true },
            },
          ],
        },
      ],
    } as unknown as Membership;

    const membershipResponse: MembershipResponse = {
      memberships: [membershipForTenant],
    } as MembershipResponse;

    buildEffectiveModulesFromMembershipMock.mockReturnValue([]);

    const action = loadTenantPermissions.fulfilled(
      { membership: membershipResponse, tenantSlug: 'coolitoral' },
      'req-flat',
      'coolitoral',
    );

    const state = permissionsSlice.reducer(
      createInitialPermissionsState({ loading: true }),
      action,
    );

    expect(state.flatPermissions).toEqual([
      'vehicle:read',
      'vehicle:stats',
    ]);
  });

  it('sets flatPermissions to empty when tenant membership is missing', () => {
    const membershipResponse: MembershipResponse = {
      memberships: [],
    } as unknown as MembershipResponse;

    const action = loadTenantPermissions.fulfilled(
      { membership: membershipResponse, tenantSlug: 'coolitoral' },
      'req-flat-empty',
      'coolitoral',
    );

    const state = permissionsSlice.reducer(
      createInitialPermissionsState({ loading: true }),
      action,
    );

    expect(state.flatPermissions).toEqual([]);
  });
});

describe('flat permissions selectors', () => {
  it('selectFlatPermissions returns flatPermissions array', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        flatPermissions: ['vehicle:read'],
      }),
    );

    expect(selectFlatPermissions(state)).toEqual(['vehicle:read']);
  });

  it('selectPermissionsReady is false while loading', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        loading: true,
        membership: null,
      }),
    );

    expect(selectPermissionsReady(state)).toBe(false);
  });

  it('selectPermissionsReady is true when membership loaded and not loading', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        loading: false,
        membership: { memberships: [] } as unknown as MembershipResponse,
      }),
    );

    expect(selectPermissionsReady(state)).toBe(true);
  });
});

describe('selectHasPermission', () => {
  it('returns false while permissions are loading', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        loading: true,
        flatPermissions: ['vehicle:read'],
      }),
    );

    expect(selectHasPermission('vehicle:read')(state)).toBe(false);
  });

  it('returns false when membership is null', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        membership: null,
        flatPermissions: ['vehicle:read'],
      }),
    );

    expect(selectHasPermission('vehicle:read')(state)).toBe(false);
  });

  it('returns true for existing permission (case-insensitive)', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        membership: { memberships: [] } as unknown as MembershipResponse,
        flatPermissions: ['vehicle:read'],
      }),
    );

    expect(selectHasPermission('Vehicle:READ')(state)).toBe(true);
  });

  it('returns false for missing permission', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        membership: { memberships: [] } as unknown as MembershipResponse,
        flatPermissions: ['vehicle:read'],
      }),
    );

    expect(selectHasPermission('vehicle:stats')(state)).toBe(false);
  });

  it('returns false for invalid permission strings', () => {
    const state = buildRootState(
      createInitialPermissionsState({
        membership: { memberships: [] } as unknown as MembershipResponse,
        flatPermissions: ['vehicle:read'],
      }),
    );

    expect(selectHasPermission('')(state)).toBe(false);
    expect(selectHasPermission('vehicle')(state)).toBe(false);
    expect(selectHasPermission('vehicle:')(state)).toBe(false);
    expect(selectHasPermission(':read')(state)).toBe(false);
  });
});
