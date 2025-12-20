import apiClient from './apiClientService';

export type CatalogOption = {
  id: number;
  label: string;
  code: string | null;
};

export type CatalogsResolveResponse = {
  data: Record<string, CatalogOption[]>;
};

export async function resolveCatalogs(
  tenantSlug: string,
  keys: string[],
): Promise<CatalogsResolveResponse> {
  const cleanedKeys = Array.from(
    new Set(keys.map((k) => String(k ?? '').trim()).filter(Boolean)),
  );

  const response = await apiClient.post<CatalogsResolveResponse>(
    '/v1/catalogs/resolve',
    { keys: cleanedKeys },
    {
      headers: {
        'X-Tenant': tenantSlug,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
}
