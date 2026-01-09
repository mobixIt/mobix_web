import { type Route } from '@playwright/test';

export const FE_PORT = 4567;
export const TENANT_SLUG = 'coolitoral';

export const getTenantBaseUrl = (slug: string): string => `http://${slug}.localhost:${FE_PORT}`;

export const isDataRequest = (route: Route): boolean => {
  const type = route.request().resourceType();
  return type === 'xhr' || type === 'fetch';
};

export const VehicleApiPaths = {
  index: /\/v1\/vehicles(\?.*)?$/,
  stats: /\/v1\/vehicles\/stats$/,
  catalogs: '**/v1/catalogs/resolve'
};

export const getPathname = (url: string): string => {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
};
