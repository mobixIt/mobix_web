import { test, expect } from '@playwright/test';
import { TENANT_SLUG } from '../support/api-utils';
import { mockAppAuth } from '../support/auth-mocks';
import { mockVehiclesCatalogs, mockVehiclesIndexWithSink, type CapturedRequest } from '../support/vehicle-mocks';
import { VehiclesPage } from '../support/vehicles-pom';

test.describe('Vehicles Inventory Filters', () => {
  test('should send correct filters in the API payload', async ({ page }) => {
    const vehiclesRequests: CapturedRequest[] = [];
    const vehiclesPage = new VehiclesPage(page);

    await mockAppAuth(page, TENANT_SLUG, [{ id: 100, subject_class: 'vehicle', action: 'read', app_module: { id: 1, name: 'Vehicles', active: true, description: '' } }]);
    await mockVehiclesCatalogs(page); 
    await mockVehiclesIndexWithSink(page, (req) => vehiclesRequests.push(req));

    await vehiclesPage.goto();

    await vehiclesPage.filters.open();
    
    await vehiclesPage.filters.toggleAdvanced();

    await vehiclesPage.filters.fillSearch('BUS123');
    await vehiclesPage.filters.selectMuiOption(/Estado/i, 'Activo');
    await vehiclesPage.filters.selectMuiOption(/Marca/i, /Chevrolet/i);
    await vehiclesPage.filters.selectAsyncOption(/buscar propietario/i, /Ana Rodríguez/i);
    
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/vehicles') && res.status() === 200),
      vehiclesPage.filters.apply()
    ]);

    await expect.poll(() => vehiclesRequests.length).toBeGreaterThanOrEqual(2);
    const lastRequest = vehiclesRequests[vehiclesRequests.length - 1];
    const params = new URL(lastRequest.url).searchParams;
    const getFilterValue = (key: string) => params.get(`filters[${key}]`) || params.get(`filters.${key}`);

    expect(getFilterValue('q')).toBe('BUS123');
    expect(getFilterValue('status')).toBe('active');
    expect(getFilterValue('brand_id')).toBe('10');
    expect(getFilterValue('owner_id')).toBe('201');
  });
});
