import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMe } from '@/store/slices/authSlice';
import * as userAuthService from '@/services/userAuthService';
import type { MeResponse } from '@/types/access-control';
import type { ApiErrorResponse } from '@/types/api';
import type { AxiosError } from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import permissionsReducer from '@/store/slices/permissionsSlice';
import vehiclesReducer from '@/store/slices/vehiclesSlice';

vi.mock('@/services/userAuthService', async () => {
  const actual = await vi.importActual<typeof import('@/services/userAuthService')>(
    '@/services/userAuthService',
  );

  return {
    ...actual,
    fetchUserInfo: vi.fn(),
  };
});

const mockedFetchUserInfo = vi.mocked(userAuthService.fetchUserInfo);

function createRootStateTypedStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      permissions: permissionsReducer,
      vehicles: vehiclesReducer,
    },
  });
}

describe('fetchMe async thunk behavior on success and error branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches fulfilled action with MeResponse when auth.status is idle and fetchUserInfo resolves successfully', async () => {
    const meResponse: MeResponse = {
      id: 'user-123',
      first_name: 'Ana',
      last_name: 'Lopez',
      email: 'ana@example.com',
      phone: null,
    } as unknown as MeResponse;

    mockedFetchUserInfo.mockResolvedValueOnce({ data: meResponse });

    const store = createRootStateTypedStore();
    const result = await store.dispatch(fetchMe());

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
    expect(fetchMe.fulfilled.match(result)).toBe(true);

    if (fetchMe.fulfilled.match(result)) {
      expect(result.type).toBe('auth/fetchMe/fulfilled');
      expect(result.payload).toEqual(meResponse);
    }
  });

  it('dispatches rejected action with structured payload when auth.status is idle and AxiosError contains detail', async () => {
    const apiError: ApiErrorResponse = {
      errors: [
        {
          code: 'UNAUTHORIZED',
          title: 'Unauthorized',
          detail: 'Token is invalid or expired',
        },
      ],
    };

    const axiosError = {
      response: {
        status: 401,
        data: apiError,
      },
      message: 'Request failed with status code 401',
    } as AxiosError<ApiErrorResponse>;

    mockedFetchUserInfo.mockRejectedValueOnce(axiosError);

    const store = createRootStateTypedStore();
    const result = await store.dispatch(fetchMe());

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
    expect(fetchMe.rejected.match(result)).toBe(true);

    if (fetchMe.rejected.match(result)) {
      expect(result.type).toBe('auth/fetchMe/rejected');
      expect(result.payload).toEqual({
        message: 'Token is invalid or expired',
        status: 401,
      });
      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.meta.rejectedWithValue).toBe(true);
    }
  });

  it('uses title as fallback message when detail is missing and auth.status is idle', async () => {
    const apiError: ApiErrorResponse = {
      errors: [
        {
          code: 'UNAUTHORIZED',
          title: 'Unauthorized access',
          detail: '',
        },
      ],
    };

    const axiosError = {
      response: {
        status: 403,
        data: apiError,
      },
      message: 'Forbidden',
    } as AxiosError<ApiErrorResponse>;

    mockedFetchUserInfo.mockRejectedValueOnce(axiosError);

    const store = createRootStateTypedStore();
    const result = await store.dispatch(fetchMe());

    expect(fetchMe.rejected.match(result)).toBe(true);

    if (fetchMe.rejected.match(result)) {
      expect(result.payload).toEqual({
        message: 'Unauthorized access',
        status: 403,
      });
    }
  });

  it('uses axios error message when neither detail nor title exist and auth.status is idle', async () => {
    const apiError: ApiErrorResponse = {
      errors: [
        {
          code: 'SERVER_ERROR',
          title: '',
          detail: '',
        },
      ],
    };

    const axiosError = {
      response: {
        status: 500,
        data: apiError,
      },
      message: 'Internal Server Error',
    } as AxiosError<ApiErrorResponse>;

    mockedFetchUserInfo.mockRejectedValueOnce(axiosError);

    const store = createRootStateTypedStore();
    const result = await store.dispatch(fetchMe());

    expect(fetchMe.rejected.match(result)).toBe(true);

    if (fetchMe.rejected.match(result)) {
      expect(result.payload).toEqual({
        message: 'Internal Server Error',
        status: 500,
      });
    }
  });

  it('uses generic fallback message when response and message are missing and auth.status is idle', async () => {
    const axiosError = {
      response: undefined,
      message: '',
    } as AxiosError<ApiErrorResponse>;

    mockedFetchUserInfo.mockRejectedValueOnce(axiosError);

    const store = createRootStateTypedStore();
    const result = await store.dispatch(fetchMe());

    expect(fetchMe.rejected.match(result)).toBe(true);

    if (fetchMe.rejected.match(result)) {
      expect(result.payload).toEqual({
        message: 'No se pudo cargar la información del usuario',
        status: undefined,
      });
    }
  });

  it('does not call fetchUserInfo and returns rejected with meta.condition when auth.status is not idle', async () => {
    const store = createRootStateTypedStore();

    const seededUser: MeResponse = {
      id: 'user-seeded',
      first_name: 'Seeded',
      last_name: 'User',
      email: 'seeded@user.com',
      phone: null,
    } as unknown as MeResponse;

    store.dispatch(fetchMe.fulfilled(seededUser, 'seed', undefined));

    const result = await store.dispatch(fetchMe());

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(0);
    expect(fetchMe.rejected.match(result)).toBe(true);

    if (fetchMe.rejected.match(result)) {
      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.meta.condition).toBe(true);
    }
  });
});
