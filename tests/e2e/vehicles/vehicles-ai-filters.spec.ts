import { test, expect } from '../support/fixtures';
import { TENANT_SLUG, getTenantBaseUrl } from '../support/api-utils';
import { mockAppAuth } from '../support/auth-mocks';

import { 
  mockVehiclesIndexWithSink, 
  mockVehiclesStats, 
  buildStatsResponse,
  mockVehiclesCatalogs,
  type CapturedRequest 
} from '../support/vehicle-mocks';

test.describe('Vehicles AI Filters', () => {
  const vehiclesRequests: CapturedRequest[] = [];

  test.beforeEach(async ({ page }) => {
    vehiclesRequests.length = 0;
    
    await mockAppAuth(page, TENANT_SLUG, [
      { 
        id: 100, 
        subject_class: 'vehicle', 
        action: 'read', 
        app_module: { id: 1, name: 'Vehicles', active: true, description: '' } 
      }
    ]);
    
    await mockVehiclesCatalogs(page);
    
    await mockVehiclesStats(page, async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(buildStatsResponse()) });
    });

    await mockVehiclesIndexWithSink(page, (req: CapturedRequest) => vehiclesRequests.push(req));
  });

  test('removing an AI chip keeps remaining filters and updates the prompt', async ({ vehiclesPage, page }) => {
    await vehiclesPage.goto();

    const aiInput = vehiclesPage.ai.getQueryInput();
    await aiInput.fill('busetas hino con capacidad mayor a 40');
    
    const initialResponse = page.waitForResponse(res => res.url().includes('ai_question'));
    await page.keyboard.press('Enter');
    await initialResponse;

    const brandChip = vehiclesPage.chips.getChip('brand_id'); 
    const capacityChip = vehiclesPage.chips.getChip('capacity_total_gt');

    await expect(brandChip).toBeVisible({ timeout: 15000 });
    await expect(brandChip).toContainText(/3/i); 
    await expect(capacityChip).toContainText(/40/i);

    const updateResponse = page.waitForResponse(res => res.url().includes('ai_question'));
    await vehiclesPage.chips.remove('capacity_total_gt');
    await updateResponse;

    await expect(capacityChip).toBeHidden();
    await expect(brandChip).toBeVisible({ timeout: 10000 });
    
    await expect(aiInput).toHaveValue(/marca 3/i);
  });

  test('removing a filter chip updates URL and persists after reload', async ({ vehiclesPage, page }) => {
    const queryParams = '?ai_question=busetas+activas&status=active&vehicle_class_id=2';
    await page.goto(`${getTenantBaseUrl(TENANT_SLUG)}/vehicles${queryParams}`);
    
    const statusChip = vehiclesPage.chips.getChip('status');
    const classChip = vehiclesPage.chips.getChip('vehicle_class_id');

    await expect(statusChip).toBeVisible({ timeout: 10000 });
    await expect(classChip).toBeVisible({ timeout: 10000 });

    const removalPromise = page.waitForResponse(res => res.url().includes('ai_question'));
    await vehiclesPage.chips.remove('status');
    await removalPromise;

    await expect(page).not.toHaveURL(/status=active/);

    await page.reload();
    
    await expect(classChip).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/ai_question=/);
  });
});
