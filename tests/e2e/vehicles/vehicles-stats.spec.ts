import { test, expect, type Page, type Route } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

const FE_PORT = 4567;

function baseUrlForTenant(tenantSlug: string) {
  return `http://${tenantSlug}.localhost:${FE_PORT}`;
}

function isApiRequest(route: Route) {
  const rt = route.request().resourceType();
  // Playwright resource types: document|xhr|fetch|script|stylesheet|image|font|...
  return rt === 'xhr' || rt === 'fetch';
}

function urlPath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

function isVehiclesStatsApiUrl(url: string) {
  const path = urlPath(url);
  // Covers: /v1/vehicles/stats, /api/firstparty/v1/vehicles/stats, etc.
  return /\/v1\/vehicles\/stats$/.test(path) || /\/api\/firstparty\/v1\/vehicles\/stats$/.test(path);
}

function isVehiclesIndexApiUrl(url: string) {
  const path = urlPath(url);

  // Do not match the FE route /vehicles
  if (path === '/vehicles') return false;

  // Covers: /v1/vehicles, /api/firstparty/v1/vehicles
  const isIndex = /\/v1\/vehicles$/.test(path) || /\/api\/firstparty\/v1\/vehicles$/.test(path);

  // Avoid catching /v1/vehicles/stats
  const isStats = path.endsWith('/vehicles/stats');

  return isIndex && !isStats;
}

async function mockAuthenticatedTenantUserWithVehiclesStatsPermissions(
  page: Page,
  tenantSlug: string,
) {
  await setActiveIdleCookie(page);

  const vehicleRead = {
    id: 100,
    subject_class: 'vehicle',
    action: 'read',
    app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
  };

  const vehicleStats = {
    id: 101,
    subject_class: 'vehicle',
    action: 'stats',
    app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
  };

  await page.route('**/auth/me**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'Single',
          last_name: 'Tenant',
          email: 'single@tenant.test',
          phone: null,
        },
      }),
    });
  });

  await page.route('**/auth/membership**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'Single',
          last_name: 'Tenant',
          email: 'single@tenant.test',
          phone: null,
          memberships: [
            {
              id: 1,
              active: true,
              tenant: {
                id: 1,
                slug: tenantSlug,
                client: { name: 'Coolitoral', logo_url: '' },
              },
              // Covers multiple shapes used by the FE
              tenant_permissions: [vehicleRead, vehicleStats],
              roles: [
                {
                  id: 10,
                  name: 'Manager',
                  key: 'manager',
                  tenant_permissions: [vehicleRead, vehicleStats],
                  permissions: [vehicleRead, vehicleStats],
                },
              ],
            },
          ],
        },
      }),
    });
  });
}

async function mockVehiclesIndexOk(page: Page) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();

    // Only intercept API calls (fetch/xhr), never the /vehicles document
    if (!isApiRequest(route)) {
      await route.fallback();
      return;
    }

    if (!isVehiclesIndexApiUrl(url)) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: {
          page: 1,
          per_page: 10,
          pages: 1,
          count: 0,
          prev: null,
          next: null,
        },
      }),
    });
  });
}

type VehiclesStatsResponse = {
  data: {
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
  meta: {
    as_of: string;
    timezone: string;
    computed_at: string;
    warnings: string[];
  };
};

function buildStatsResponse(overrides?: {
  data?: Partial<VehiclesStatsResponse['data']>;
  meta?: Partial<VehiclesStatsResponse['meta']>;
}): VehiclesStatsResponse {
  return {
    data: {
      total: 10,
      active: 7,
      inactive: 3,
      new_this_month: 2,
      total_prev_month: 8,
      delta_total_vs_prev_month: 2,
      delta_total_pct_vs_prev_month: 25.1,
      active_pct_of_total: 70.0,
      inactive_pct_of_total: 30.0,
      new_prev_month: 1,
      delta_new_vs_prev_month: 1,
      ...(overrides?.data ?? {}),
    },
    meta: {
      as_of: '2026-01-31T23:59:59-05:00',
      timezone: 'America/Bogota',
      computed_at: '2026-02-01T00:00:00-05:00',
      warnings: [],
      ...(overrides?.meta ?? {}),
    },
  };
}

async function mockVehiclesStats(page: Page, handler: (route: Route) => Promise<void>) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();

    // Only API fetch/xhr
    if (!isApiRequest(route)) {
      await route.fallback();
      return;
    }

    if (!isVehiclesStatsApiUrl(url)) {
      await route.fallback();
      return;
    }

    await handler(route);
  });
}

async function gotoVehicles(page: Page, tenantSlug: string) {
  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);
  await expect(page.getByTestId('vehicles-page')).toBeVisible();
}

async function openStats(page: Page) {
  const statsBtn = page.getByRole('button', { name: /estadísticas/i });
  await expect(statsBtn).toBeVisible();
  await statsBtn.click();
  await expect(page.getByTestId('index-page-cards')).toBeVisible();
}

test('vehicles page shows stats skeleton while stats request is in-flight', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  await mockAuthenticatedTenantUserWithVehiclesStatsPermissions(page, tenantSlug);
  await mockVehiclesIndexOk(page);

  await mockVehiclesStats(page, async (route: Route) => {
    // Keep it in-flight long enough to assert skeleton
    await new Promise((r) => setTimeout(r, 30_000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildStatsResponse()),
    });
  });

  await gotoVehicles(page, tenantSlug);
  await openStats(page);

  await expect(page.getByTestId('vehicles-stats-skeleton-total')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-skeleton-active')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-skeleton-inactive')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-skeleton-new')).toBeVisible();
});

test('vehicles page renders 4 stats tiles after successful load', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  await mockAuthenticatedTenantUserWithVehiclesStatsPermissions(page, tenantSlug);
  await mockVehiclesIndexOk(page);

  await mockVehiclesStats(page, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildStatsResponse()),
    });
  });

  await gotoVehicles(page, tenantSlug);
  await openStats(page);

  await expect(page.getByTestId('vehicles-stats-total')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-active')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-inactive')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-new-this-month')).toBeVisible();
});

test('vehicles stats error state provides retry action that re-dispatches the request', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  await mockAuthenticatedTenantUserWithVehiclesStatsPermissions(page, tenantSlug);
  await mockVehiclesIndexOk(page);

  let calls = 0;

  await mockVehiclesStats(page, async (route: Route) => {
    calls += 1;

    // Covers the two automatic dispatches (page load + stats panel mount)
    if (calls <= 2) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'error' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildStatsResponse({ data: { delta_total_pct_vs_prev_month: 10.0 } })),
    });
  });

  // Listen for the first 500 before navigating to avoid race conditions
  const firstFailPromise = page.waitForResponse((res) => {
    const path = urlPath(res.url());
    const isStats =
      path.includes('/v1/vehicles/stats') || path.includes('/api/firstparty/v1/vehicles/stats');
    return isStats && res.status() === 500;
  });

  await gotoVehicles(page, tenantSlug);
  await firstFailPromise;

  await openStats(page);

  const retryButton = page.getByTestId('vehicles-stats-retry');
  await expect(retryButton).toBeVisible();

  const okPromise = page.waitForResponse((res) => {
    const path = urlPath(res.url());
    const isStats =
      path.includes('/v1/vehicles/stats') || path.includes('/api/firstparty/v1/vehicles/stats');
    return isStats && res.status() === 200;
  });

  await retryButton.click();
  await okPromise;

  await expect(page.getByTestId('vehicles-stats-total')).toBeVisible();
});
