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

async function mockAuthenticatedTenantUserWithVehiclesReadPermissions(page: Page, tenantSlug: string) {
  await setActiveIdleCookie(page);

  const vehicleRead = {
    id: 100,
    subject_class: 'vehicle',
    action: 'read',
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
              tenant_permissions: [vehicleRead],
              roles: [
                {
                  id: 10,
                  name: 'Manager',
                  key: 'manager',
                  tenant_permissions: [vehicleRead],
                  permissions: [vehicleRead],
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

async function gotoVehicles(page: Page, tenantSlug: string) {
  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);
  await expect(page.getByTestId('vehicles-page')).toBeVisible();
}

async function openFilters(page: Page) {
  const filtersToggle = page.getByRole('button', { name: /filtros/i }).first();
  await expect(filtersToggle).toBeVisible();
  await filtersToggle.click();
  await expect(page.getByTestId('index-page-filters')).toBeVisible();
}

test('vehicles filters uses collapsedRows=1, expands advanced fields, and enforces minCharsToSearch before async search', async ({
  page,
}) => {
  const tenantSlug = 'coolitoral';

  await mockAuthenticatedTenantUserWithVehiclesReadPermissions(page, tenantSlug);
  await mockVehiclesIndexOk(page);

  await gotoVehicles(page, tenantSlug);
  await openFilters(page);

  const ownerInput = page.getByPlaceholder(/buscar propietario/i);
  const driverInput = page.getByPlaceholder(/buscar conductor/i);

  await expect(ownerInput).toHaveCount(0);
  await expect(driverInput).toHaveCount(0);

  const advancedToggle = page.getByRole('button', { name: /mostrar filtros avanzados/i });
  await expect(advancedToggle).toBeVisible();
  await advancedToggle.click();

  await expect(ownerInput).toBeVisible();
  await expect(driverInput).toBeVisible();

  await ownerInput.fill('A');

  const ownerOptionAna = page.getByRole('option', { name: /ana rodríguez.*propietario/i });
  await expect(ownerOptionAna).toHaveCount(0);

  await page.waitForTimeout(800);
  await expect(ownerOptionAna).toHaveCount(0);

  await ownerInput.fill('An');

  await page.waitForTimeout(150);
  await expect(ownerOptionAna).toHaveCount(0);

  await expect(ownerOptionAna).toBeVisible({ timeout: 2500 });
});
