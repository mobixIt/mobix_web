import { test, expect } from '@playwright/test';
import { mockAuthenticatedTenantUser } from './support/auth';
import { mockVehiclesIndexOk, mockVehiclesStats } from './support/vehicles';
import { baseUrlForTenant } from './support/urls';
import type { Route } from '@playwright/test';
import type { TenantPermission } from './support/auth.types';

test('removing an AI chip keeps remaining filters and updates the prompt', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  const vehicleRead: TenantPermission = {
    id: 100,
    subject_class: 'vehicle',
    action: 'read',
    app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
  };

  await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead]);
  await mockVehiclesIndexOk(page);
  await mockVehiclesStats(page, async (route: Route) => {
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
          as_of: new Date().toISOString(),
          timezone: 'America/Bogota',
          computed_at: new Date().toISOString(),
          warnings: [],
        },
      }),
    });
  });

  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles`);
  await expect(page.getByTestId('vehicles-page')).toBeVisible({ timeout: 15000 });

  const input = page.getByPlaceholder('Pregúntale a Mobix IA...');
  await expect(input).toBeVisible({ timeout: 15000 });
  await input.fill('busetas marca hino con capacidad mayor a 40');
  const initialResponse = page.waitForResponse((res) => res.url().includes('/v1/vehicles') && res.request().url().includes('ai_question'));
  await page.getByLabel(/send question/i).click();
  await initialResponse;

  const brandChip = page.getByTestId('active-filter-chip-brand');
  const capacityChip = page.getByTestId('active-filter-chip-capacity_total_gt');

  await expect(brandChip).toContainText(/Marca: Hino/i);
  await expect(capacityChip).toContainText(/Capacidad Total \(>\): 40/i);

  const updatedResponse = page.waitForResponse((res) => {
    const url = res.url();
    const reqUrl = res.request().url();
    return url.includes('/v1/vehicles') && reqUrl.includes('ai_question=') && !reqUrl.includes('capacidad');
  });
  await capacityChip.locator('svg').first().click();
  await updatedResponse;

  await expect(capacityChip).toBeHidden({ timeout: 10000 });
  await expect(brandChip).toBeVisible();
  await expect(input).toHaveValue(/marca hino/i);
});

test('removing a filter chip updates URL and persists after reload with ai_question', async ({ page }) => {
  const tenantSlug = 'coolitoral';

  const vehicleRead: TenantPermission = {
    id: 100,
    subject_class: 'vehicle',
    action: 'read',
    app_module: { id: 1, name: 'Vehicles', description: 'Vehicles module', active: true },
  };

  await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead]);
  await mockVehiclesIndexOk(page);
  await mockVehiclesStats(page, async (route: Route) => {
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
          as_of: new Date().toISOString(),
          timezone: 'America/Bogota',
          computed_at: new Date().toISOString(),
          warnings: [],
        },
      }),
    });
  });

  await page.goto(`${baseUrlForTenant(tenantSlug)}/vehicles?ai_question=busetas+activas&status=active&vehicle_class_id=2`);
  await expect(page.getByTestId('vehicles-page')).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/ai_question=busetas\+activas/);

  const statusChip = page.getByTestId('active-filter-chip-status');
  await expect(statusChip).toBeVisible({ timeout: 10000 });

  const removalResponse = page.waitForResponse((res) => {
    const reqUrl = res.request().url();
    return res.url().includes('/v1/vehicles') && !reqUrl.includes('status=active') && reqUrl.includes('ai_question');
  });
  await statusChip.locator('svg').first().click();
  await removalResponse;

  await expect(page).not.toHaveURL(/status=active/);

  await page.reload();

  await expect(page).toHaveURL(/ai_question=veh%C3%ADculos\+marca\+hino\+clase\+buseta/i);
  await expect(page).not.toHaveURL(/status=active/);
});
