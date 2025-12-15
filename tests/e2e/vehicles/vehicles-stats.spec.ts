import { test, expect, type Page, type Route } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

const FE_PORT = 4567;

function baseUrlForTenant(tenantSlug: string) {
  return `http://${tenantSlug}.localhost:${FE_PORT}`;
}

async function mockAuthenticatedTenantUserWithVehiclesStatsPermissions(page: Page, tenantSlug: string) {
  await setActiveIdleCookie(page);

  await page.route('**/auth/me', async (route: Route) => {
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

  await page.route('**/auth/membership', async (route: Route) => {
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
              roles: [
                {
                  id: 10,
                  name: 'Manager',
                  key: 'manager',
                  tenant_permissions: [],
                  permissions: [
                    // 👇 IMPORTANTE:
                    // Usa subject_class como lo consume el FE: 'vehicle'
                    // y módulo 'Vehicles'
                    {
                      id: 100,
                      subject_class: 'vehicle',
                      action: 'read',
                      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
                    },
                    {
                      id: 101,
                      subject_class: 'vehicle',
                      action: 'stats',
                      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
                    },
                  ],
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
  await page.route('**/v1/vehicles**', async (route: Route) => {
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

test('vehicles page shows stats skeleton while request is in-flight', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  await mockAuthenticatedTenantUserWithVehiclesStatsPermissions(page, tenantSlug);
  await mockVehiclesIndexOk(page);

  await page.route('**/v1/vehicles/stats**', async () => {
    await new Promise(() => {});
  });

  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);

  await expect(page.getByTestId('vehicles-stats-skeleton-total')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-skeleton-active')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-skeleton-inactive')).toBeVisible();
  await expect(page.getByTestId('vehicles-stats-skeleton-new')).toBeVisible();
});

test('vehicles page renders 4 stats tiles after successful load', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  await mockAuthenticatedTenantUserWithVehiclesStatsPermissions(page, tenantSlug);
  await mockVehiclesIndexOk(page);

  await page.route('**/v1/vehicles/stats**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildStatsResponse()),
    });
  });

  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);

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

  await page.route('**/v1/vehicles/stats**', async (route: Route) => {
    calls += 1;

    if (calls === 1) {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildStatsResponse({ data: { delta_total_pct_vs_prev_month: 10.0 } })),
    });
  });

  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);

  const retryButton = page.getByRole('button', { name: 'Reintentar' });
  await expect(retryButton).toBeVisible();

  await retryButton.click();

  await expect(page.getByTestId('vehicles-stats-total')).toBeVisible();
});