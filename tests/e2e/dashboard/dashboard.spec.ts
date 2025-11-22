import { test, expect, type Page } from '@playwright/test';

async function setActiveIdleCookie(page: Page) {
  await page.addInitScript(() => {
    const meta = {
      last_activity_at: Date.now(),
      idle_timeout_minutes: 10,
      expires_at: Date.now() + 60 * 60 * 1000,
    };

    document.cookie =
      'mobix_idle_meta=' +
      encodeURIComponent(JSON.stringify(meta)) +
      '; path=/; SameSite=Lax';
  });
}

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

test('shows error state in TenantDashboard when membership API fails', async ({ page }) => {
  await setActiveIdleCookie(page);

  await page.route('**/auth/membership', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [
          {
            code: 'NO_ACTIVE_MEMBERSHIP',
            title: 'No active membership',
            detail: 'User has no active membership for this tenant.',
          },
        ],
      }),
    });
  });

  await page.goto('http://coolitoral.localhost:4567/dashboard');

  await expect(page.getByTestId('tenant-dashboard-error')).toBeVisible();
  await expect(page.getByText(/NO_ACTIVE_MEMBERSHIP/)).toBeVisible();
});

test('shows "no membership" message when response has no membership for current tenant', async ({ page }) => {
  await setActiveIdleCookie(page);

  await page.route('**/auth/membership', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'Multi',
          last_name: 'Tenant',
          email: 'multi@tenant.test',
          phone: null,
          memberships: [
            {
              id: 'm-1',
              active: true,
              tenant: { id: 't-1', slug: 'otrotenant' },
              roles: [],
            },
          ],
        },
      }),
    });
  });

  await page.goto('http://coolitoral.localhost:4567/dashboard');

  await expect(page.getByTestId('tenant-dashboard')).toBeVisible();
  await expect(page.getByTestId('current-membership-none')).toBeVisible();
});
