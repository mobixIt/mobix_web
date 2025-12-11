import { test, expect } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

const DASHBOARD_TENANT_URL = 'http://coolitoral.localhost:4567/dashboard';
const DASHBOARD_BASE_URL = 'http://localhost:4567/dashboard';

test('bootstraps session with /auth/me and /auth/membership on /dashboard', async ({ page }) => {
  await setActiveIdleCookie(page);

  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

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
              id: 'm-1',
              active: true,
              tenant: { id: 't-1', slug: 'coolitoral' },
              roles: [
                {
                  id: 1,
                  name: 'Operador',
                  key: 'operador',
                  tenant_permissions: [],
                  permissions: [],
                },
              ],
            },
          ],
        },
      }),
    });
  });

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;

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

  await page.goto(DASHBOARD_TENANT_URL);

  await expect(page.getByTestId('tenant-dashboard')).toBeVisible();
  await expect(page.getByTestId('current-person-name')).toHaveText(/Single Tenant/i);
  await expect(page.getByTestId('current-person-email')).toHaveText(/single@tenant\.test/i);

  const rolesList = page.getByTestId('current-membership-roles');
  await expect(rolesList).toContainText(/Operador/i);

  expect(meCalls).toBe(1);
  expect(membershipCalls).toBe(1);

  await expect(page).toHaveURL(DASHBOARD_TENANT_URL);
});

test('redirects to base /login when no session cookie is present', async ({ page }) => {
  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto(DASHBOARD_TENANT_URL);

  await page.waitForURL(/\/login/, { timeout: 5_000 });

  const finalUrl = new URL(page.url());
  expect(finalUrl.hostname).toBe('localhost');
  expect(finalUrl.pathname).toBe('/login');

  expect(meCalls).toBe(0);
  expect(membershipCalls).toBe(0);

  const idleCookie = await page.evaluate(() => {
    const all = document.cookie?.split('; ') ?? [];
    return all.find((c) => c.startsWith('mobix_idle_meta=')) ?? null;
  });
  expect(idleCookie).toBeNull();
});

test('redirects to base /login when /auth/me returns 401', async ({ page }) => {
  await setActiveIdleCookie(page);

  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [
          {
            code: 'UNAUTHORIZED',
            title: 'Unauthorized',
            detail: 'User is not authorized',
          },
        ],
      }),
    });
  });

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto(DASHBOARD_TENANT_URL);

  await page.waitForURL(/\/login/, { timeout: 5_000 });

  const finalUrl = new URL(page.url());
  expect(finalUrl.hostname).toBe('localhost');
  expect(finalUrl.pathname).toBe('/login');

  expect(meCalls).toBe(1);
  expect(membershipCalls).toBe(0);
});

test('shows 500 error page when /auth/me returns 500 and does not redirect to /login', async ({ page }) => {
  await setActiveIdleCookie(page);

  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [
          {
            code: 'INTERNAL_SERVER_ERROR',
            title: 'Internal Server Error',
            detail: 'Unexpected error while loading user',
          },
        ],
      }),
    });
  });

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto(DASHBOARD_TENANT_URL);

  const errorBox = page.getByTestId('server-error-page');
  await expect(errorBox).toBeVisible();

  await expect(errorBox).toContainText(/Ocurrió un error en el servidor/i);
  await expect(errorBox).toContainText(/Código de error:\s*500/i);

  await expect(page).toHaveURL(DASHBOARD_TENANT_URL);

  expect(meCalls).toBe(1);
  expect(membershipCalls).toBe(0);
});

test('does not refetch /auth/me or /auth/membership when navigating from /dashboard to /vehicles via SPA', async ({ page }) => {
  await setActiveIdleCookie(page);

  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;
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

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

    const membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [
        {
          id: 10,
          name: 'Manager',
          key: 'manager',
          tenant_permissions: [],
          permissions: [
            {
              id: 100,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
            {
              id: 101,
              subject_class: 'Vehicle',
              action: 'update',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
          ],
        },
        {
          id: 11,
          name: 'Viewer',
          key: 'viewer',
          tenant_permissions: [],
          permissions: [
            {
              id: 102,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
          ],
        },
      ],
    };

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
          memberships: [membership],
        },
      }),
    });
  });

  await page.goto(DASHBOARD_TENANT_URL);
  await expect(page.getByTestId('tenant-dashboard')).toBeVisible();

  expect(meCalls).toBe(1);
  expect(membershipCalls).toBe(1);

  const configItem = page.getByTestId('nav-item-configuration');
  await expect(configItem).toBeVisible();
  await configItem.click();

  const vehiclesLink = page.getByTestId('nav-link-vehicles');
  await expect(vehiclesLink).toBeVisible();
  await vehiclesLink.click();

  await page.waitForURL(/\/vehicles$/, { timeout: 5_000 });

  await expect(page.getByTestId('vehicles-header-title')).toBeVisible();

  expect(meCalls).toBe(1);
  expect(membershipCalls).toBe(1);
});

test('reload on /vehicles keeps sidebar and permissions', async ({ page }) => {
  await setActiveIdleCookie(page);

  const VEHICLES_TENANT_URL = 'http://coolitoral.localhost:4567/vehicles';

  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;
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

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

    const membership = {
      id: 1,
      active: true,
      tenant: {
        id: 1,
        slug: 'coolitoral',
        client: { name: 'Coolitoral', logo_url: '' },
      },
      roles: [
        {
          id: 10,
          name: 'Manager',
          key: 'manager',
          tenant_permissions: [],
          permissions: [
            {
              id: 100,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
            {
              id: 101,
              subject_class: 'Vehicle',
              action: 'update',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
          ],
        },
        {
          id: 11,
          name: 'Viewer',
          key: 'viewer',
          tenant_permissions: [],
          permissions: [
            {
              id: 102,
              subject_class: 'Vehicle',
              action: 'read',
              app_module: {
                id: 1,
                name: 'Vehicles',
                description: 'Vehicles module',
                active: true,
              },
            },
          ],
        },
      ],
    };

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
          memberships: [membership],
        },
      }),
    });
  });

  await page.goto(VEHICLES_TENANT_URL);

  await expect(page.getByTestId('nav-item-configuration')).toBeVisible();
  await expect(page.getByTestId('vehicles-header-title')).toBeVisible();
  await expect(page).toHaveURL(VEHICLES_TENANT_URL);

  expect(meCalls).toBe(1);
  expect(membershipCalls).toBe(1);

  await page.reload();

  await expect(page.getByTestId('nav-item-configuration')).toBeVisible();
  await expect(page.getByTestId('vehicles-header-title')).toBeVisible();
  await expect(page).toHaveURL(VEHICLES_TENANT_URL);

  expect(meCalls).toBe(2);
  expect(membershipCalls).toBe(2);
});

test('does not call /auth/membership when hostname has no valid tenant slug', async ({ page }) => {
  await setActiveIdleCookie(page);

  let meCalls = 0;
  let membershipCalls = 0;

  await page.route('**/auth/me', async (route) => {
    meCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'Base',
          last_name: 'User',
          email: 'base@user.test',
          phone: null,
        },
      }),
    });
  });

  await page.route('**/auth/membership', async (route) => {
    membershipCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto(DASHBOARD_BASE_URL);

  await expect(page).toHaveURL(DASHBOARD_BASE_URL);

  expect(membershipCalls).toBe(0);
  expect(meCalls).toBeLessThanOrEqual(1);
});