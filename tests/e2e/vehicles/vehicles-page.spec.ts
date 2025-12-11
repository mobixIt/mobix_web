import { test, expect, type Page, type Route } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

const VEHICLES_TENANT_URL = 'http://coolitoral.localhost:4567/vehicles';

async function mockAuthenticatedTenantUserWithVehiclesPermissions(page: Page) {
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
}

test.describe('Vehicles page end-to-end behavior for authenticated tenant user', () => {
  test('renders vehicles page container, header and table content', async ({ page }) => {
    await setActiveIdleCookie(page);
    await mockAuthenticatedTenantUserWithVehiclesPermissions(page);

    await page.goto(VEHICLES_TENANT_URL);

    const pageContainer = page.getByTestId('vehicles-page');
    await expect(pageContainer).toBeVisible();

    const header = page.getByTestId('vehicles-header-title');
    await expect(header).toBeVisible();
    await expect(header).toHaveText(/veh[ií]culos/i);

    const layout = page.getByTestId('index-page-layout');
    await expect(layout).toBeVisible();

    const tableRegion = page.getByTestId('index-page-table');
    await expect(tableRegion).toBeVisible();
    await expect(tableRegion).toContainText(/Listado de vehículos/i);
  });
});
