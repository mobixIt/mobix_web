import { test, expect } from '../support/fixtures'; // Importación clave
import { TENANT_SLUG, getTenantBaseUrl, VehicleApiPaths } from '../support/api-utils';
import { mockAppAuth } from '../support/auth-mocks';
import { 
  mockVehiclesIndexOk, 
  mockVehiclesStats, 
  buildStatsResponse 
} from '../support/vehicle-mocks';
import { VehiclesPage } from '../support/vehicles-pom';
import type { Permission } from '@/types/access-control';
import type { Route } from '@playwright/test';

test.describe('Vehicles Main Page & Permissions', () => {
  const createPerm = (id: number, action: string): Permission => ({
    id,
    subject_class: 'vehicle',
    action,
    app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true }
  });

  test('renders header and table container for authenticated user with vehicle:read', async ({ page, vehiclesPage }) => {
    const vehicleRead = createPerm(100, 'read');

    await mockAppAuth(page, TENANT_SLUG, [vehicleRead]);
    await mockVehiclesIndexOk(page);

    await vehiclesPage.goto();

    await expect(page.getByTestId('vehicles-header')).toBeVisible();
    await expect(page.getByTestId('index-page-layout')).toBeVisible();
    await expect(page.getByTestId('index-page-table')).toBeVisible();
  });

  test('hides create button when vehicle:create permission is missing and shows it when present', async ({ page, vehiclesPage }) => {
    const vehicleRead = createPerm(100, 'read');
    const vehicleCreate = createPerm(101, 'create');

    await mockAppAuth(page, TENANT_SLUG, [vehicleRead]);
    await mockVehiclesIndexOk(page);
    await vehiclesPage.goto();

    await expect(page.getByRole('button', { name: /crear nuevo vehículo/i })).toHaveCount(0);

    const freshContext = await page.context().browser()!.newContext();
    const freshPage = await freshContext.newPage();
    const freshVehiclesPage = new VehiclesPage(freshPage);
    
    await mockAppAuth(freshPage, TENANT_SLUG, [vehicleRead, vehicleCreate]);
    await mockVehiclesIndexOk(freshPage);
    await freshVehiclesPage.goto();

    await expect(freshPage.getByRole('button', { name: /crear nuevo vehículo/i })).toBeVisible();
    await freshPage.close();
  });

  test('toggles stats button visibilita based on vehicle:stats permission', async ({ page, vehiclesPage }) => {
    const vehicleRead = createPerm(100, 'read');
    const vehicleStats = createPerm(102, 'stats');

    let statsRequests = 0;
    const statsHandler = async (route: Route) => {
      statsRequests++;
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify(buildStatsResponse()) 
      });
    };

    await mockVehiclesStats(page, statsHandler);
    await mockAppAuth(page, TENANT_SLUG, [vehicleRead]);
    await mockVehiclesIndexOk(page);
    await vehiclesPage.goto();

    await expect(page.getByRole('button', { name: /estadísticas/i })).toHaveCount(0);
    expect(statsRequests).toBe(0);

    await mockAppAuth(page, TENANT_SLUG, [vehicleRead, vehicleStats]);
    await page.reload();
    
    await expect(page.getByRole('button', { name: /estadísticas/i })).toBeVisible();
  });

  test('redirects to /login when vehicles stats request returns 401', async ({ page }) => {
    const perms = [createPerm(100, 'read'), createPerm(101, 'stats')];

    await mockAppAuth(page, TENANT_SLUG, perms);
    await mockVehiclesIndexOk(page);

    await mockVehiclesStats(page, async (route: Route) => {
      await route.fulfill({ 
        status: 401, 
        contentType: 'application/json', 
        body: JSON.stringify({ message: 'unauthorized' }) 
      });
    });

    const stats401Response = page.waitForResponse(
      (res) => VehicleApiPaths.stats.test(res.url()) && res.status() === 401
    );

    await page.goto(`${getTenantBaseUrl(TENANT_SLUG)}/vehicles`);

    await stats401Response;
    await page.waitForURL(/\/login$/, { timeout: 8000 });
  });
});
