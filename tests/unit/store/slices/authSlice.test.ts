import { describe, it, expect } from 'vitest';
import authReducer, {
  clearAuth,
  fetchMe,
  selectAuthError,
  selectAuthErrorStatus,
  selectAuthStatus,
  selectCurrentPerson,
} from '@/store/slices/authSlice';
import type { AuthState } from '@/store/slices/authSlice';
import type { MeResponse } from '@/types/access-control';
import type { RootState } from '@/store/store';

type RootStateWithAuthOnlyRealisticShape = RootState;

const buildRootState = (auth: AuthState): RootStateWithAuthOnlyRealisticShape =>
  ({
    auth,
    permissions: {
      loading: false,
      error: null,
      membership: null,
      effectiveModules: [],
    },
    vehicles: {
      items: [],
      status: 'idle',
      error: null,
    },
  } as unknown as RootStateWithAuthOnlyRealisticShape);

const buildMeResponse = (): MeResponse =>
  ({
    id: 'user-abc',
    first_name: 'Unit',
    last_name: 'Tester',
    email: 'unit@test.com',
    phone: null,
  }) as unknown as MeResponse;

describe('authSlice reducer and selectors', () => {
  it('initial state is idle with empty user and no errors', () => {
    const initialAuthState = authReducer(undefined, { type: 'init' });
    const rootState = buildRootState(initialAuthState);

    expect(selectAuthStatus(rootState)).toBe('idle');
    expect(selectCurrentPerson(rootState)).toBeNull();
    expect(selectAuthError(rootState)).toBeNull();
    expect(selectAuthErrorStatus(rootState)).toBeNull();
  });

  it('clearAuth resets me, status and errors to the initial shape', () => {
    const preState: AuthState = {
      me: buildMeResponse(),
      status: 'succeeded',
      error: 'Previous error',
      errorStatus: 500,
    };

    const after = authReducer(preState, clearAuth());
    const rootState = buildRootState(after);

    expect(selectAuthStatus(rootState)).toBe('idle');
    expect(selectCurrentPerson(rootState)).toBeNull();
    expect(selectAuthError(rootState)).toBeNull();
    expect(selectAuthErrorStatus(rootState)).toBeNull();
  });

  it('fetchMe.pending sets loading and clears error fields', () => {
    const preState: AuthState = {
      me: buildMeResponse(),
      status: 'failed',
      error: 'Old error',
      errorStatus: 401,
    };

    const after = authReducer(preState, { type: fetchMe.pending.type });
    const rootState = buildRootState(after);

    expect(selectAuthStatus(rootState)).toBe('loading');
    expect(selectAuthError(rootState)).toBeNull();
    expect(selectAuthErrorStatus(rootState)).toBeNull();
  });

  it('fetchMe.fulfilled stores user and sets succeeded', () => {
    const me = buildMeResponse();

    const preState: AuthState = {
      me: null,
      status: 'loading',
      error: null,
      errorStatus: null,
    };

    const after = authReducer(preState, {
      type: fetchMe.fulfilled.type,
      payload: me,
    });

    const rootState = buildRootState(after);

    expect(selectAuthStatus(rootState)).toBe('succeeded');
    expect(selectCurrentPerson(rootState)).toEqual(me);
    expect(selectAuthError(rootState)).toBeNull();
    expect(selectAuthErrorStatus(rootState)).toBeNull();
  });

  it('fetchMe.rejected stores rejectWithValue payload message and status, and clears user', () => {
    const preState: AuthState = {
      me: buildMeResponse(),
      status: 'loading',
      error: null,
      errorStatus: null,
    };

    const after = authReducer(preState, {
      type: fetchMe.rejected.type,
      payload: { message: 'Session expired', status: 401 },
    });

    const rootState = buildRootState(after);

    expect(selectAuthStatus(rootState)).toBe('failed');
    expect(selectCurrentPerson(rootState)).toBeNull();
    expect(selectAuthError(rootState)).toBe('Session expired');
    expect(selectAuthErrorStatus(rootState)).toBe(401);
  });

  it('fetchMe.rejected uses fallback message and null status when payload is missing', () => {
    const preState: AuthState = {
      me: buildMeResponse(),
      status: 'loading',
      error: null,
      errorStatus: null,
    };

    const after = authReducer(preState, { type: fetchMe.rejected.type });
    const rootState = buildRootState(after);

    expect(selectAuthStatus(rootState)).toBe('failed');
    expect(selectCurrentPerson(rootState)).toBeNull();
    expect(selectAuthError(rootState)).toBe('Error desconocido');
    expect(selectAuthErrorStatus(rootState)).toBeNull();
  });
});
