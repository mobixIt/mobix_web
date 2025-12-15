import apiClient from './apiClientService';

export type VehiclesStatsData = {
  total: number;
  active: number;
  inactive: number;
  new_this_month: number;

  total_prev_month: number;
  delta_total_vs_prev_month: number;
  delta_total_pct_vs_prev_month: number;

  active_pct_of_total: number;
  inactive_pct_of_total: number;

  new_prev_month: number;
  delta_new_vs_prev_month: number;
};

export type VehiclesStatsMeta = {
  as_of: string;
  timezone: string;
  computed_at: string;
  warnings: string[];
};

export type VehiclesStatsResponse = {
  data: VehiclesStatsData;
  meta: VehiclesStatsMeta;
};

export async function fetchVehiclesStatsFromApi(
  tenantSlug: string,
): Promise<VehiclesStatsResponse> {
  const response = await apiClient.get<VehiclesStatsResponse>(
    '/v1/vehicles/stats',
    {
      headers: { 'X-Tenant': tenantSlug },
    },
  );

  return response.data;
}
