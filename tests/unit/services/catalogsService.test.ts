import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosResponse } from 'axios';

import apiClient from '@/services/apiClientService';
import { resolveCatalogs } from '@/services/catalogsService';

type CatalogOption = {
  id: number;
  label: string;
  code: string | null;
};

type CatalogsResolveResponse = {
  data: Record<string, CatalogOption[]>;
};

vi.mock('@/services/apiClientService', () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

const mockedApiClient = apiClient as unknown as { post: ReturnType<typeof vi.fn> };

describe('resolveCatalogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deduplicates and trims keys, posts to the expected endpoint, and returns response.data', async () => {
    const tenantSlug = 'coolitoral';
    const keys = [' brands ', 'drivers', 'drivers', '', '   ', 'owners'];

    const responseData: CatalogsResolveResponse = {
      data: {
        brands: [{ id: 1, label: 'Toyota', code: 'TYT' }],
        drivers: [{ id: 2, label: 'Juan Perez', code: null }],
        owners: [{ id: 3, label: 'Ana Rodriguez', code: 'AR' }],
      },
    };

    mockedApiClient.post.mockResolvedValue({
      data: responseData,
    } as AxiosResponse<CatalogsResolveResponse>);

    const result = await resolveCatalogs(tenantSlug, keys);

    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/v1/catalogs/resolve',
      { keys: ['brands', 'drivers', 'owners'] },
      {
        headers: {
          'X-Tenant': tenantSlug,
          'Content-Type': 'application/json',
        },
      },
    );

    expect(result).toEqual(responseData);
  });

  it('sends an empty keys array when all provided keys are blank after normalization', async () => {
    const tenantSlug = 'coolitoral';
    const keys = ['', '   ', '\n\t', String(null), String(undefined)];

    const responseData: CatalogsResolveResponse = { data: {} };

    mockedApiClient.post.mockResolvedValue({
      data: responseData,
    } as AxiosResponse<CatalogsResolveResponse>);

    const result = await resolveCatalogs(tenantSlug, keys);

    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/v1/catalogs/resolve',
      { keys: ['null', 'undefined'] },
      {
        headers: {
          'X-Tenant': tenantSlug,
          'Content-Type': 'application/json',
        },
      },
    );

    expect(result).toEqual(responseData);
  });

  it('propagates apiClient.post errors', async () => {
    const tenantSlug = 'coolitoral';
    const keys = ['brands'];

    const error = new Error('Network error');
    mockedApiClient.post.mockRejectedValue(error);

    await expect(resolveCatalogs(tenantSlug, keys)).rejects.toThrow('Network error');
  });
});
