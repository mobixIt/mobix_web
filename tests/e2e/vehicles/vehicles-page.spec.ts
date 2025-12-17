import { test, expect, type Page, type Route } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

const FE_PORT = 4567;

function baseUrlForTenant(tenantSlug: string) {
  return `http://${tenantSlug}.localhost:${FE_PORT}`;
}

function isApiRequest(route: Route) {
  const rt = route.request().resourceType();
  return rt === 'xhr' || rt === 'fetch';
}

function urlPath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

function isVehiclesIndexApiUrl(url: string) {
  const path = urlPath(url);
  if (path === '/vehicles') return false;
  const isIndex = /\/v1\/vehicles$/.test(path) || /\/api\/firstparty\/v1\/vehicles$/.test(path);
  const isStats = path.endsWith('/vehicles/stats');
  return isIndex && !isStats;
}

function isVehiclesStatsApiUrl(url: string) {
  const path = urlPath(url);
  return /\/v1\/vehicles\/stats$/.test(path) || /\/api\/firstparty\/v1\/vehicles\/stats$/.test(path);
}

type TenantPermission = {
  id: number;
  subject_class: string;
  action: string;
  app_module: { id: number; name: string; description: string; active: boolean };
};

type AuthMeResponse = {
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
};

type AuthMembershipResponse = {
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    memberships: Array<{
      id: number;
      active: boolean;
      tenant: { id: number; slug: string; client: { name: string; logo_url: string } };
      tenant_permissions: TenantPermission[];
      roles: Array<{
        id: number;
        name: string;
        key: string;
        tenant_permissions: TenantPermission[];
        permissions: TenantPermission[];
      }>;
    }>;
  };
};

async function mockAuthenticatedTenantUser(
  page: Page,
  tenantSlug: string,
  permissions: TenantPermission[],
) {
  await setActiveIdleCookie(page);

  const me: AuthMeResponse = {
    data: {
      id: 'user-1',
      first_name: 'Single',
      last_name: 'Tenant',
      email: 'single@tenant.test',
      phone: null,
    },
  };

  const membership: AuthMembershipResponse = {
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
          tenant: { id: 1, slug: tenantSlug, client: { name: 'Coolitoral', logo_url: '' } },
          tenant_permissions: permissions,
          roles: [
            {
              id: 10,
              name: 'Manager',
              key: 'manager',
              tenant_permissions: permissions,
              permissions,
            },
          ],
        },
      ],
    },
  };

  await page.route('**/auth/me**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) });
  });

  await page.route('**/auth/membership**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(membership),
    });
  });
}

async function mockVehiclesIndexOk(page: Page) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();
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

function buildStatsResponse(): VehiclesStatsResponse {
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
    },
    meta: {
      as_of: '2026-01-31T23:59:59-05:00',
      timezone: 'America/Bogota',
      computed_at: '2026-02-01T00:00:00-05:00',
      warnings: [],
    },
  };
}

async function mockVehiclesStats(page: Page, handler: (route: Route) => Promise<void>) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();
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

test.describe('Vehicles page', () => {
  test('renders header and table container for authenticated user with vehicle:read', async ({
    page,
  }) => {
    const tenantSlug = 'coolitoral';

    const vehicleRead: TenantPermission = {
      id: 100,
      subject_class: 'vehicle',
      action: 'read',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead]);
    await mockVehiclesIndexOk(page);

    await gotoVehicles(page, tenantSlug);

    await expect(page.getByTestId('vehicles-header')).toBeVisible();
    await expect(page.getByTestId('index-page-layout')).toBeVisible();
    await expect(page.getByTestId('index-page-table')).toBeVisible();
  });

  test('hides create button when vehicle:create permission is missing and shows it when present', async ({
    page,
  }) => {
    const tenantSlug = 'coolitoral';

    const vehicleRead: TenantPermission = {
      id: 100,
      subject_class: 'vehicle',
      action: 'read',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    const vehicleCreate: TenantPermission = {
      id: 101,
      subject_class: 'vehicle',
      action: 'create',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead]);
    await mockVehiclesIndexOk(page);

    await gotoVehicles(page, tenantSlug);

    const createButtonA = page.getByRole('button', { name: /crear nuevo vehículo/i });
    await expect(createButtonA).toHaveCount(0);

    await page.close();

    const freshPage = await page.context().newPage();

    await mockAuthenticatedTenantUser(freshPage, tenantSlug, [vehicleRead, vehicleCreate]);
    await mockVehiclesIndexOk(freshPage);

    await gotoVehicles(freshPage, tenantSlug);

    const createButtonB = freshPage.getByRole('button', { name: /crear nuevo vehículo/i });
    await expect(createButtonB).toBeVisible();
  });

  test('does not request vehicles stats when vehicle:stats is missing and shows stats toggle when present', async ({
    page,
  }) => {
    const tenantSlug = 'coolitoral';

    const vehicleRead: TenantPermission = {
      id: 100,
      subject_class: 'vehicle',
      action: 'read',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    let statsRequests = 0;

    await mockVehiclesStats(page, async (route: Route) => {
      statsRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildStatsResponse()),
      });
    });

    await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead]);
    await mockVehiclesIndexOk(page);

    await gotoVehicles(page, tenantSlug);

    await expect(page.getByRole('button', { name: /estadísticas/i })).toHaveCount(0);
    expect(statsRequests).toBe(0);

    await page.close();

    const freshPage = await page.context().newPage();

    const vehicleStats: TenantPermission = {
      id: 102,
      subject_class: 'vehicle',
      action: 'stats',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    await mockVehiclesStats(freshPage, async (route: Route) => {
      statsRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildStatsResponse()),
      });
    });

    await mockAuthenticatedTenantUser(freshPage, tenantSlug, [vehicleRead, vehicleStats]);
    await mockVehiclesIndexOk(freshPage);

    await gotoVehicles(freshPage, tenantSlug);

    const statsToggle = freshPage.getByRole('button', { name: /estadísticas/i });
    await expect(statsToggle).toBeVisible();
  });

  test('redirects to /login when vehicles stats request returns 401', async ({ page }) => {
    const tenantSlug = 'coolitoral';

    const vehicleRead: TenantPermission = {
      id: 100,
      subject_class: 'vehicle',
      action: 'read',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    const vehicleStats: TenantPermission = {
      id: 101,
      subject_class: 'vehicle',
      action: 'stats',
      app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
    };

    await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead, vehicleStats]);
    await mockVehiclesIndexOk(page);

    await mockVehiclesStats(page, async (route: Route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'unauthorized' }),
      });
    });

    const stats401Response = page.waitForResponse((res) => isVehiclesStatsApiUrl(res.url()) && res.status() === 401);

    await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);

    await stats401Response;
    await page.waitForURL(/\/login$/, { timeout: 8000 });
  });
});
