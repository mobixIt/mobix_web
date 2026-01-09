import { test, expect } from '../support/fixtures';
import { TENANT_SLUG, VehicleApiPaths } from '../support/api-utils';
import { mockAppAuth } from '../support/auth-mocks';
import { 
  mockVehiclesIndexOk, 
  mockVehiclesStats, 
  buildStatsResponse 
} from '../support/vehicle-mocks';
import type { Route } from '@playwright/test';

test.describe('Vehicles Statistics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppAuth(page, TENANT_SLUG, [
      { id: 100, subject_class: 'vehicle', action: 'read', app_module: { id: 1, name: 'Vehicles', active: true, description: '' } },
      { id: 101, subject_class: 'vehicle', action: 'stats', app_module: { id: 1, name: 'Vehicles', active: true, description: '' } }
    ]);
    await mockVehiclesIndexOk(page);
  });

  test('should show stats skeleton while request is in-flight', async ({ vehiclesPage, page }) => {
    await mockVehiclesStats(page, async (route: Route) => {
      await new Promise((r) => setTimeout(r, 2000)); 
      await route.fulfill({ status: 200, body: JSON.stringify(buildStatsResponse()) });
    });

    await vehiclesPage.goto();
    await vehiclesPage.stats.open();

    await expect(page.getByTestId('vehicles-stats-skeleton-total')).toBeVisible();
    await expect(page.getByTestId('vehicles-stats-skeleton-active')).toBeVisible();
  });

  test('should render all stats tiles after successful load', async ({ vehiclesPage, page }) => {
    await mockVehiclesStats(page, async (route: Route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(buildStatsResponse()) });
    });

    await vehiclesPage.goto();
    await vehiclesPage.stats.open();

    await expect(page.getByTestId('vehicles-stats-total')).toBeVisible();
    await expect(page.getByTestId('vehicles-stats-active')).toBeVisible();
    await expect(page.getByTestId('vehicles-stats-inactive')).toBeVisible();
    await expect(page.getByTestId('vehicles-stats-new-this-month')).toBeVisible();
  });

  test('should allow retrying the request if it fails initially', async ({ vehiclesPage, page }) => {
    let calls = 0;

    await mockVehiclesStats(page, async (route: Route) => {
      calls++;
      if (calls <= 2) {
        return route.fulfill({ status: 500, body: JSON.stringify({ message: 'API Error' }) });
      }
      return route.fulfill({ status: 200, body: JSON.stringify(buildStatsResponse()) });
    });

    const firstFail = page.waitForResponse(res => VehicleApiPaths.stats.test(res.url()) && res.status() === 500);
    
    await vehiclesPage.goto();
    await firstFail;
    await vehiclesPage.stats.open();

    const retrySuccess = page.waitForResponse(res => VehicleApiPaths.stats.test(res.url()) && res.status() === 200);
    
    await vehiclesPage.stats.retry();
    await retrySuccess;

    await expect(page.getByTestId('vehicles-stats-total')).toBeVisible();
  });
});
