import { test, expect, type Route } from '@playwright/test';
import { mockAuthenticatedTenantUser } from './support/auth';
import { mockVehiclesIndexOk, mockVehiclesStats } from './support/vehicles';

const tenantSlug = 'coolitoral';
const vehicleRead = { id: 100, subject_class: 'vehicle', action: 'read', app_module: { id: 1, name: 'Vehicles', description: 'Vehicles', active: true } };
const vehicleStats = { id: 101, subject_class: 'vehicle', action: 'stats', app_module: { id: 1, name: 'Vehicles', description: 'Vehicles', active: true } };

const fulfillStats = async (route: Route) => {
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
        timezone: 'UTC',
        computed_at: new Date().toISOString(),
        warnings: [],
      },
    }),
  });
};

test('IA toolbar detecta consulta histórica y muestra acciones', async ({ page }) => {
  await mockAuthenticatedTenantUser(page, tenantSlug, [vehicleRead, vehicleStats]);
  await mockVehiclesIndexOk(page);
  await mockVehiclesStats(page, fulfillStats);

  await page.goto(`http://${tenantSlug}.localhost:4567/vehicles`);

  const aiInput = page.getByLabel('AI question input');
  await expect(aiInput).toBeVisible({ timeout: 30000 });
  await aiInput.fill('¿Qué pasó ayer con los vehículos?');
  await page.getByLabel('send question').click();
  await expect(page.getByText('Consulta histórica detectada')).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Abrir reporte' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver analíticas' })).toBeVisible();
});
