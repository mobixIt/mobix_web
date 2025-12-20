import { test, expect, type Page, type Route } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

const FE_PORT = 4567;
const TENANT_SLUG = 'coolitoral';

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

function isVehiclesStatsUrl(url: string) {
  const path = urlPath(url);
  return /\/v1\/vehicles\/stats$/.test(path) || /\/api\/firstparty\/v1\/vehicles\/stats$/.test(path);
}

async function mockAuthenticatedTenantUser(page: Page, tenantSlug: string) {
  await setActiveIdleCookie(page);

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

  const vehicleRead = {
    id: 100,
    subject_class: 'vehicle',
    action: 'read',
    app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
  };

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

async function mockVehiclesCatalogs(page: Page, delayMs = 80) {
  await page.route('**/v1/catalogs/resolve', async (route: Route) => {
    if (route.request().method() !== 'POST') return route.fallback();

    await new Promise((r) => setTimeout(r, delayMs));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          brands: [{ id: 10, label: 'Chevrolet', code: 'CHEV' }],
          vehicle_classes: [{ id: 20, label: 'Bus', code: 'BUS' }],
          body_types: [{ id: 30, label: 'Camioneta', code: 'CAM' }],
          owners: [
            { id: 201, label: 'Ana Rodríguez', code: 'ANA' },
            { id: 202, label: 'Carlos Perez', code: 'CAR' },
          ],
          drivers: [{ id: 301, label: 'Juan Conductor', code: 'JC' }],
        },
      }),
    });
  });
}

type CapturedRequest = { url: string; headers: Record<string, string> };

async function mockVehiclesIndex(page: Page, sink: CapturedRequest[]) {
  await page.route('**/*', async (route: Route) => {
    const req = route.request();
    const url = req.url();

    if (!isApiRequest(route)) return route.fallback();

    if (isVehiclesStatsUrl(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            total: 0,
            active: 0,
            inactive: 0,
            new_this_month: 0,
            total_prev_month: 0,
            delta_total_vs_prev_month: 0,
            delta_total_pct_vs_prev_month: 0,
            active_pct_of_total: 0,
            inactive_pct_of_total: 0,
            new_prev_month: 0,
            delta_new_vs_prev_month: 0,
          },
          meta: {
            as_of: '2024-01-01T00:00:00Z',
            timezone: 'UTC',
            computed_at: '2024-01-01T00:00:00Z',
            warnings: [],
          },
        }),
      });
      return;
    }

    if (!isVehiclesIndexApiUrl(url)) return route.fallback();

    sink.push({ url, headers: req.headers() });

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

async function gotoVehicles(page: Page) {
  await page.goto(`${baseUrlForTenant(TENANT_SLUG)}/vehicles`);
  await expect(page.getByTestId('vehicles-page')).toBeVisible();
}

async function openFiltersPanel(page: Page) {
  const toggle = page.getByRole('button', { name: /filtros/i }).first();
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByTestId('index-page-filters')).toBeVisible();
}

async function openMuiSelectByLabel(container: ReturnType<Page['locator']>, label: RegExp) {
  const selectLabel = container.locator('label').filter({ hasText: label }).first();
  await expect(selectLabel).toBeVisible();
  const controlId = await selectLabel.getAttribute('for');
  const control = controlId ? container.locator(`#${controlId}`) : selectLabel;
  await control.click();
}

async function pickMuiOption(page: Page, name: RegExp | string) {
  const option =
    typeof name === 'string'
      ? page.getByRole('option', { name, exact: true })
      : page.getByRole('option', { name });
  await expect(option).toBeVisible();
  await option.click();
}

test('vehicles filters collapse, catalogs, async selects, and filtered request payload', async ({ page }) => {
  const vehiclesRequests: CapturedRequest[] = [];

  await mockAuthenticatedTenantUser(page, TENANT_SLUG);
  await mockVehiclesCatalogs(page);
  await mockVehiclesIndex(page, vehiclesRequests);

  const catalogsResponse = page.waitForResponse((res) => urlPath(res.url()).endsWith('/v1/catalogs/resolve'));

  await gotoVehicles(page);
  await openFiltersPanel(page);

  const filtersContainer = page.getByTestId('index-page-filters');

  await expect(filtersContainer.getByText('Marca')).toHaveCount(0);

  const advancedToggle = page.getByTestId('filters-section-toggle');
  await expect(advancedToggle).toBeVisible();
  await advancedToggle.click();

  await catalogsResponse;

  const ownerInput = filtersContainer.getByPlaceholder(/buscar propietario/i);
  const driverInput = filtersContainer.getByPlaceholder(/buscar conductor/i);

  await expect(ownerInput).toBeEnabled({ timeout: 10000 });
  await expect(driverInput).toBeEnabled({ timeout: 10000 });

  const searchInput = filtersContainer.getByPlaceholder(/buscar por placa/i);
  await expect(searchInput).toBeVisible();
  await searchInput.fill('BUS123');

  await openMuiSelectByLabel(filtersContainer, /estado/i);
  await pickMuiOption(page, 'Activo');

  await openMuiSelectByLabel(filtersContainer, /marca/i);
  await pickMuiOption(page, /chevrolet/i);

  await openMuiSelectByLabel(filtersContainer, /clase/i);
  await pickMuiOption(page, /^bus$/i);

  await openMuiSelectByLabel(filtersContainer, /carrocería/i);
  await pickMuiOption(page, /camioneta/i);

  await ownerInput.click();
  await pickMuiOption(page, /ana rodríguez/i);
  await expect(ownerInput).toHaveValue(/ana rodríguez/i);

  await driverInput.click();
  await pickMuiOption(page, /juan conductor/i);
  await expect(driverInput).toHaveValue(/juan conductor/i);

  const modelYearInput = filtersContainer.getByPlaceholder(/ej:\s*2022/i);
  await expect(modelYearInput).toBeVisible();
  await modelYearInput.fill('2024');

  await filtersContainer.getByTestId('filters-section-apply').click();

  await expect.poll(() => vehiclesRequests.length).toBeGreaterThanOrEqual(2);

  const initialRequest = vehiclesRequests[0];
  const filteredRequest = vehiclesRequests[vehiclesRequests.length - 1];

  const initialParams = new URL(initialRequest.url).searchParams;
  const initialFilterKeys = Array.from(initialParams.keys()).filter((key) => key.startsWith('filters'));
  expect(initialFilterKeys).toHaveLength(0);
  expect(initialRequest.headers['x-tenant']).toBe(TENANT_SLUG);

  const filteredParams = new URL(filteredRequest.url).searchParams;
  expect(filteredRequest.headers['x-tenant']).toBe(TENANT_SLUG);

  expect(filteredParams.get('page[number]') ?? filteredParams.get('page.number')).toBe('1');
  expect(filteredParams.get('page[size]') ?? filteredParams.get('page.size')).toBe('10');

  expect(filteredParams.get('filters[q]') ?? filteredParams.get('filters.q')).toBe('BUS123');
  expect(filteredParams.get('filters[status]') ?? filteredParams.get('filters.status')).toBe('active');
  expect(filteredParams.get('filters[brand_id]') ?? filteredParams.get('filters.brand_id')).toBe('10');
  expect(filteredParams.get('filters[vehicle_class_id]') ?? filteredParams.get('filters.vehicle_class_id')).toBe('20');
  expect(filteredParams.get('filters[body_type_id]') ?? filteredParams.get('filters.body_type_id')).toBe('30');
  expect(filteredParams.get('filters[owner_id]') ?? filteredParams.get('filters.owner_id')).toBe('201');
  expect(filteredParams.get('filters[driver_id]') ?? filteredParams.get('filters.driver_id')).toBe('301');
  expect(filteredParams.get('filters[model_year]') ?? filteredParams.get('filters.model_year')).toBe('2024');
});
