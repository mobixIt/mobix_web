import { test, expect } from '../support/fixtures';
import { TENANT_SLUG } from '../support/api-utils';
import { mockAppAuth } from '../support/auth-mocks';
import { 
  mockVehiclesIndexOk, 
  mockVehiclesStats, 
  buildStatsResponse 
} from '../support/vehicle-mocks';
import type { Permission } from '@/types/access-control';

test.describe('Vehicles AI Toolbar', () => {
  const aiPermissions: Permission[] = [
    { 
      id: 100, 
      subject_class: 'vehicle', 
      action: 'read', 
      app_module: { id: 1, name: 'Vehicles', active: true, description: '' } 
    },
    { 
      id: 101, 
      subject_class: 'vehicle', 
      action: 'stats', 
      app_module: { id: 1, name: 'Vehicles', active: true, description: '' } 
    }
  ];

  test.beforeEach(async ({ page }) => {
    await mockAppAuth(page, TENANT_SLUG, aiPermissions);
    
    await mockVehiclesIndexOk(page);
    await mockVehiclesStats(page, async (route) => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify(buildStatsResponse()) 
      });
    });
  });

  test('IA toolbar detects historical query and shows suggested actions', async ({ vehiclesPage }) => {
    await vehiclesPage.goto();

    await vehiclesPage.ai.fillQuestion('¿Qué pasó ayer con los vehículos?');
    await vehiclesPage.ai.submit();

    await expect(vehiclesPage.ai.historicalBanner()).toBeVisible({ timeout: 15000 });
    
    await expect(vehiclesPage.ai.reportButton()).toBeVisible();
    await expect(vehiclesPage.ai.analyticsButton()).toBeVisible();
  });
});
