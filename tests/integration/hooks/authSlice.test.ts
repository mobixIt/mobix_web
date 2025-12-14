import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { ReducersMapObject } from '@reduxjs/toolkit';

import authReducer, {
  fetchMe,
  selectAuthError,
  selectAuthErrorStatus,
  selectAuthStatus,
  selectCurrentPerson,
} from '@/store/slices/authSlice';

import { fetchUserInfo } from '@/services/userAuthService';
import { normalizeApiError } from '@/errors/normalizeApiError';

import type { MeResponse } from '@/types/access-control';
import type { RootState } from '@/store/store';

type FetchUserInfoResponseShape = { data: MeResponse };

type NormalizedApiErrorShape = {
  message: string;
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
};

vi.mock('@/services/userAuthService', () => ({
  fetchUserInfo: vi.fn(),
}));

vi.mock('@/errors/normalizeApiError', () => ({
  normalizeApiError: vi.fn(),
}));

const mockedFetchUserInfo = vi.mocked(fetchUserInfo);
const mockedNormalizeApiError = vi.mocked(normalizeApiError);

const buildMeResponse = (id: string): MeResponse =>
  ({
    id,
    first_name: 'Integration',
    last_name: 'Tester',
    email: `${id}@test.com`,
    phone: null,
  }) as unknown as MeResponse;

const buildRootReducerForAuthOnlyButTypedAsRootState = (): ReducersMapObject<RootState> => {
  const reducerMap = { auth: authReducer } as unknown as ReducersMapObject<RootState>;
  return reducerMap;
};

const createRootStateTypedStore = () =>
  configureStore({
    reducer: buildRootReducerForAuthOnlyButTypedAsRootState(),
  });

type RootStateTypedStore = ReturnType<typeof createRootStateTypedStore>;

const readAuthRootState = (store: RootStateTypedStore): RootState =>
  store.getState() as unknown as RootState;

describe('authSlice thunk integration with condition and error normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches loading then succeeded when status is idle and fetchUserInfo resolves', async () => {
    const store = createRootStateTypedStore();
    const me = buildMeResponse('user-1');

    const resolvedResponse: FetchUserInfoResponseShape = { data: me };
    mockedFetchUserInfo.mockResolvedValueOnce(resolvedResponse);

    const stateBefore = readAuthRootState(store);
    expect(selectAuthStatus(stateBefore)).toBe('idle');
    expect(selectCurrentPerson(stateBefore)).toBeNull();

    const dispatchPromise = store.dispatch(fetchMe());

    const stateAfterPending = readAuthRootState(store);
    expect(selectAuthStatus(stateAfterPending)).toBe('loading');

    await dispatchPromise;

    const stateFinal = readAuthRootState(store);
    expect(selectAuthStatus(stateFinal)).toBe('succeeded');
    expect(selectCurrentPerson(stateFinal)).toEqual(me);
    expect(selectAuthError(stateFinal)).toBeNull();
    expect(selectAuthErrorStatus(stateFinal)).toBeNull();
    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
  });

  it('dispatches loading then failed and clears user when status is idle and fetchUserInfo rejects, using normalizeApiError output', async () => {
    const store = createRootStateTypedStore();
    const preloadedUser = buildMeResponse('user-old');

    store.dispatch(fetchMe.fulfilled(preloadedUser, 'seed', undefined));

    store.dispatch({ type: 'auth/forceIdleForRefetch', payload: null });

    const stateAfterSeed = readAuthRootState(store);
    expect(selectAuthStatus(stateAfterSeed)).toBe('succeeded');
    expect(selectCurrentPerson(stateAfterSeed)).toEqual(preloadedUser);

    const normalized: NormalizedApiErrorShape = {
      message: 'Session expired',
      status: 401,
    };

    const rawError = new Error('network-like error');
    mockedFetchUserInfo.mockRejectedValueOnce(rawError);
    mockedNormalizeApiError.mockReturnValueOnce(normalized);

    const storeStateBeforeRefetch = readAuthRootState(store);
    const authStateBeforeRefetch = storeStateBeforeRefetch.auth;
    const forcedIdleAuthState = {
      ...authStateBeforeRefetch,
      status: 'idle' as const,
    };

    store.dispatch(fetchMe.fulfilled(forcedIdleAuthState.me as unknown as MeResponse, 'noop', undefined));

    const idleResetState = readAuthRootState(store);
    const idleResetAuthState = {
      ...idleResetState.auth,
      status: 'idle' as const,
    };

    const storeWithIdleAuth = configureStore({
      reducer: buildRootReducerForAuthOnlyButTypedAsRootState(),
      preloadedState: { auth: idleResetAuthState } as unknown as RootState,
    });

    const dispatchPromise = storeWithIdleAuth.dispatch(fetchMe());

    const during = storeWithIdleAuth.getState() as unknown as RootState;
    expect(selectAuthStatus(during)).toBe('loading');

    await dispatchPromise;

    const final = storeWithIdleAuth.getState() as unknown as RootState;
    expect(selectAuthStatus(final)).toBe('failed');
    expect(selectCurrentPerson(final)).toBeNull();
    expect(selectAuthError(final)).toBe('Session expired');
    expect(selectAuthErrorStatus(final)).toBe(401);

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
    expect(mockedNormalizeApiError).toHaveBeenCalledTimes(1);
  });

  it('does not call fetchUserInfo and returns rejected with meta.condition when auth.status is not idle', async () => {
    const store = createRootStateTypedStore();
    const me = buildMeResponse('user-locked');

    store.dispatch(fetchMe.fulfilled(me, 'seed', undefined));

    const stateBefore = readAuthRootState(store);
    expect(selectAuthStatus(stateBefore)).toBe('succeeded');

    const result = await store.dispatch(fetchMe());

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(0);

    expect(fetchMe.rejected.match(result)).toBe(true);
    if (fetchMe.rejected.match(result)) {
      expect(result.type).toBe('auth/fetchMe/rejected');
      expect(result.meta.condition).toBe(true);
      expect(result.meta.requestStatus).toBe('rejected');
    }
  });
});
