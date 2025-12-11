import { test, expect } from '@playwright/test';
import { setActiveIdleCookie } from '../support/idle-cookie';

test('renders TenantDashboard when tenant subdomain is present and membership is valid', async ({ page }) => {
  await setActiveIdleCookie(page);

  await page.route('**/auth/membership', async (route) => {
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
              id: 'm-1',
              active: true,
              tenant: { id: 't-1', slug: 'coolitoral' },
              roles: [
                {
                  id: 1,
                  name: 'Operador',
                  key: 'operador',
                  tenant_permissions: [],
                  permissions: [],
                },
              ],
            },
          ],
        },
      }),
    });
  });

  await page.route('**/auth/me', async (route) => {
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

  await page.goto('http://coolitoral.localhost:4567/dashboard');

  await expect(page.getByTestId('tenant-dashboard')).toBeVisible();
  await expect(page.getByTestId('current-person-name')).toHaveText(
    /Single Tenant/i
  );
  await expect(page.getByTestId('current-person-email')).toHaveText(
    /single@tenant\.test/i
  );

  const rolesList = page.getByTestId('current-membership-roles');
  await expect(rolesList).toContainText(/Operador/i);
});
