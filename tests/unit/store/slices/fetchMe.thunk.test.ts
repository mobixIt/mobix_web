import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMe } from '@/store/slices/authSlice';
import { fetchUserInfo } from '@/services/userAuthService';
import type { MeResponse } from '@/types/access-control';
import type { ApiErrorResponse } from '@/types/api';
import type { AxiosError } from 'axios';

vi.mock('@/services/userAuthService', () => ({
  fetchUserInfo: vi.fn(),
}));

const mockedFetchUserInfo = fetchUserInfo as unknown as ReturnType<typeof vi.fn>;

describe('fetchMe async thunk behavior on success and error branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches fulfilled action with MeResponse when fetchUserInfo resolves successfully', async () => {
    const meResponse: MeResponse = {
      id: 'user-123',
      first_name: 'Ana',
      last_name: 'Lopez',
      email: 'ana@example.com',
      phone: null,
    } as unknown as MeResponse;

    mockedFetchUserInfo.mockResolvedValueOnce({ data: meResponse });

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = fetchMe();
    const result = await thunk(dispatch, getState, undefined);

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
    expect(result.type).toBe('auth/fetchMe/fulfilled');
    expect(result.payload).toEqual(meResponse);
  });

  it('dispatches rejected action with structured payload when AxiosError contains detail in first error', async () => {
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

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = fetchMe();
    const result = await thunk(dispatch, getState, undefined);

    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
    expect(result.type).toBe('auth/fetchMe/rejected');
    expect(result.payload).toEqual({
      message: 'Token is invalid or expired',
      status: 401,
    });
  });

  it('uses title as fallback message when detail is missing in AxiosError payload', async () => {
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

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = fetchMe();
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('auth/fetchMe/rejected');
    expect(result.payload).toEqual({
      message: 'Unauthorized access',
      status: 403,
    });
  });

  it('uses axios error message when neither detail nor title exist in the first error entry', async () => {
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

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = fetchMe();
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('auth/fetchMe/rejected');
    expect(result.payload).toEqual({
      message: 'Internal Server Error',
      status: 500,
    });
  });

  it('uses generic fallback message when response and message are both missing', async () => {
    const axiosError = {
      response: undefined,
      message: '',
    } as AxiosError<ApiErrorResponse>;

    mockedFetchUserInfo.mockRejectedValueOnce(axiosError);

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = fetchMe();
    const result = await thunk(dispatch, getState, undefined);

    expect(result.type).toBe('auth/fetchMe/rejected');
    expect(result.payload).toEqual({
      message: 'No se pudo cargar la información del usuario',
      status: undefined,
    });
  });
});
