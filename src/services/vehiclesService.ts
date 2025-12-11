import apiClient from './apiClientService';
import type { VehiclesIndexResponse } from '@/types/vehicles/api';

export interface VehiclesIndexParams {
  page?: {
    number?: number;
    size?: number;
  };
}

export async function fetchVehiclesFromApi(
  tenantSlug: string,
  params?: VehiclesIndexParams,
): Promise<VehiclesIndexResponse> {
  const response = await apiClient.get<VehiclesIndexResponse>('/v1/vehicles', {
    params,
    headers: {
      'X-Tenant': tenantSlug,
    },
  });

  return response.data;
}


