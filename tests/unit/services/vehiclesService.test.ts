import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';

import apiClient from '@/services/apiClientService';
import { fetchVehiclesFromApi } from '@/services/vehiclesService';
import type { VehiclesIndexResponse } from '@/types/vehicles/api';

vi.mock('@/services/apiClientService', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

const mockedApiClient = apiClient as unknown as { get: ReturnType<typeof vi.fn> };

describe('fetchVehiclesFromApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /v1/vehicles with X-Tenant header and returns response.data when params are omitted', async () => {
    const tenantSlug = 'coolitoral';
    const responseData = {} as VehiclesIndexResponse;

    mockedApiClient.get.mockResolvedValue({
      data: responseData,
    } as AxiosResponse<VehiclesIndexResponse>);

    const result = await fetchVehiclesFromApi(tenantSlug);

    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/vehicles', {
      params: undefined,
      headers: { 'X-Tenant': tenantSlug },
    });

    expect(result).toBe(responseData);
  });

  it('passes params through without mutation and returns response.data', async () => {
    const tenantSlug = 'coolitoral';

    const params = {
      page: { number: 2, size: 25 },
      filters: {
        q: 'ABC-123',
        active: true,
        owner_id: 201,
        driver_id: null,
        ignored: undefined,
      },
      sort: '-created_at',
    };

    const originalSnapshot = JSON.parse(JSON.stringify(params)) as unknown;
    const responseData = {} as VehiclesIndexResponse;

    mockedApiClient.get.mockResolvedValue({
      data: responseData,
    } as AxiosResponse<VehiclesIndexResponse>);

    const result = await fetchVehiclesFromApi(tenantSlug, params);

    expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/vehicles', {
      params,
      headers: { 'X-Tenant': tenantSlug },
    });

    expect(result).toBe(responseData);
    expect(params).toEqual(originalSnapshot);
  });

  it('propagates errors thrown by apiClient.get', async () => {
    const tenantSlug = 'coolitoral';
    const error = new Error('Network error');

    mockedApiClient.get.mockRejectedValue(error);

    await expect(fetchVehiclesFromApi(tenantSlug)).rejects.toThrow('Network error');
  });

  it('sends the provided params object by reference so callers can control serialization behavior', async () => {
    const tenantSlug = 'coolitoral';
    const params = { filters: { status: 'active' } };
    const responseData = {} as VehiclesIndexResponse;

    mockedApiClient.get.mockImplementation(
      async (_url: string, config?: AxiosRequestConfig) =>
        ({
          data: responseData,
          config: config || {},
          headers: {},
          status: 200,
          statusText: 'OK',
        }) as AxiosResponse<VehiclesIndexResponse>,
    );

    await fetchVehiclesFromApi(tenantSlug, params);

    const callArgs = mockedApiClient.get.mock.calls[0];
    const configArg = callArgs[1] as AxiosRequestConfig;

    expect(configArg.params).toBe(params);
  });
});
