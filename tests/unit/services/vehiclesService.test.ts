import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/services/apiClientService';
import { fetchVehiclesFromApi } from '@/services/vehiclesService';

vi.mock('@/services/apiClientService', () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

describe('fetchVehiclesFromApi', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('sends tenant header and query params', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
    const params = { page: { number: 2, size: 10 }, ai_question: 'buses' };

    await fetchVehiclesFromApi('tenant-1', params);

    expect(apiClient.get).toHaveBeenCalledWith('/v1/vehicles', {
      params,
      headers: { 'X-Tenant': 'tenant-1' },
    });
  });

  it('returns the received data', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [{ id: 1 }] } });

    const response = await fetchVehiclesFromApi('tenant-2');

    expect(response.data).toEqual([{ id: 1 }]);
  });
});
