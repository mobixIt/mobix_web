import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  fetchMe,
  clearAuth,
  selectAuthStatus,
  selectAuthError,
  selectAuthErrorStatus,
  selectCurrentPerson,
} from '@/store/slices/authSlice';
import { fetchUserInfo } from '@/services/userAuthService';
import type { MeResponse } from '@/types/access-control';
import type { RootState } from '@/store/store';
import type { ApiErrorResponse } from '@/types/api';
import type { AxiosError } from 'axios';

vi.mock('@/services/userAuthService', () => ({
  fetchUserInfo: vi.fn(),
}));

const mockedFetchUserInfo = fetchUserInfo as unknown as ReturnType<typeof vi.fn>;

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
}

function selectAuthState(store: ReturnType<typeof createTestStore>): RootState {
  return store.getState() as RootState;
}

describe('authSlice integration with real Redux store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs full successful fetchMe flow updating store state correctly', async () => {
    const store = createTestStore();

    const meResponse: MeResponse = {
      id: 'user-999',
      first_name: 'Integration',
      last_name: 'Tester',
      email: 'integration@test.com',
      phone: null,
    } as unknown as  MeResponse;

    mockedFetchUserInfo.mockResolvedValueOnce({ data: meResponse });

    const initialState = selectAuthState(store);
    expect(selectAuthStatus(initialState)).toBe('idle');
    expect(selectCurrentPerson(initialState)).toBeNull();

    const dispatchPromise = store.dispatch(fetchMe());

    const stateDuring = selectAuthState(store);
    expect(selectAuthStatus(stateDuring)).toBe('loading');
    expect(selectAuthError(stateDuring)).toBeNull();
    expect(selectAuthErrorStatus(stateDuring)).toBeNull();

    await dispatchPromise;

    const finalState = selectAuthState(store);
    expect(selectAuthStatus(finalState)).toBe('succeeded');
    expect(selectCurrentPerson(finalState)).toEqual(meResponse);
    expect(selectAuthError(finalState)).toBeNull();
    expect(selectAuthErrorStatus(finalState)).toBeNull();
  });

  it('performs full failing fetchMe flow and clears previous user data while storing error', async () => {
    const store = createTestStore();

    const preloadedUser: MeResponse = {
      id: 'user-old',
      first_name: 'Old',
      last_name: 'User',
      email: 'old@test.com',
      phone: null,
    } as unknown as MeResponse;

    store.dispatch(
      fetchMe.fulfilled(preloadedUser, 'pre-req', undefined),
    );

    const apiError: ApiErrorResponse = {
      errors: [
        {
          code: 'UNAUTHORIZED',
          title: 'Unauthorized',
          detail: 'Session expired',
        },
      ],
    };

    const axiosError = {
      response: {
        status: 401,
        data: apiError,
      },
      message: 'Unauthorized',
    } as AxiosError<ApiErrorResponse>;

    mockedFetchUserInfo.mockRejectedValueOnce(axiosError);

    const dispatchPromise = store.dispatch(fetchMe());

    const stateDuring = selectAuthState(store);
    expect(selectAuthStatus(stateDuring)).toBe('loading');

    await dispatchPromise;

    const finalState = selectAuthState(store);
    expect(selectAuthStatus(finalState)).toBe('failed');
    expect(selectCurrentPerson(finalState)).toBeNull();
    expect(selectAuthError(finalState)).toBe('Session expired');
    expect(selectAuthErrorStatus(finalState)).toBe(401);
  });

  it('clearAuth resets store auth slice after a successful fetchMe call', async () => {
    const store = createTestStore();

    const meResponse: MeResponse = {
      id: 'user-clear',
      first_name: 'Clear',
      last_name: 'Auth',
      email: 'clear@test.com',
      phone: null,
    } as unknown as MeResponse;

    mockedFetchUserInfo.mockResolvedValueOnce({ data: meResponse });

    await store.dispatch(fetchMe());

    const stateAfterFetch = selectAuthState(store);
    expect(selectAuthStatus(stateAfterFetch)).toBe('succeeded');
    expect(selectCurrentPerson(stateAfterFetch)).toEqual(meResponse);

    store.dispatch(clearAuth());

    const finalState = selectAuthState(store);
    expect(selectAuthStatus(finalState)).toBe('idle');
    expect(selectCurrentPerson(finalState)).toBeNull();
    expect(selectAuthError(finalState)).toBeNull();
    expect(selectAuthErrorStatus(finalState)).toBeNull();
  });
});
