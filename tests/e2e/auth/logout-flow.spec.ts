import { test, expect } from '@playwright/test';

test.describe('Logout flow', () => {
  test('logs out from tenant dashboard, clears session and redirects to /login', async ({ page }) => {
    let logoutCalled = false;

    await page.route('**/auth/login', async (route) => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': 'auth_token=fake-jwt-value; Path=/; HttpOnly',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            expires_at: expiresAt,
            idle_timeout_minutes: 15,
            default_membership: {
              id: 'm-1',
              tenant: { id: 't1', slug: 'lacarolina', name: 'La Carolina' },
            },
          },
        })
      });
    });

    await page.route('**/auth/me**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            first_name: 'Harold',
            last_name: 'Rangel',
            email: 'user@example.com',
            memberships: [
              {
                id: 'm-1',
                active: true,
                tenant: {
                  id: 't1',
                  slug: 'lacarolina',
                  name: 'La Carolina',
                },
              },
            ],
          },
        }),
      });
    });

    await page.route('**/auth/membership**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            first_name: 'Harold',
            last_name: 'Rangel',
            email: 'user@example.com',
            memberships: [
              {
                id: 'm-1',
                active: true,
                tenant: {
                  id: 't1',
                  slug: 'lacarolina',
                  name: 'La Carolina',
                },
                roles: [
                  {
                    id: 'r-1',
                    name: 'Admin',
                    key: 'admin',
                    permissions: [
                      {
                        id: 'perm-1',
                        action: 'read',
                        subject_class: 'Vehicle',
                        app_module: {
                          id: 10,
                          name: 'Vehicles',
                          description: 'Vehicles management',
                          active: true,
                        },
                      },
                      {
                        id: 'perm-2',
                        action: 'update',
                        subject_class: 'Vehicle',
                        app_module: {
                          id: 10,
                          name: 'Vehicles',
                          description: 'Vehicles management',
                          active: true,
                        },
                      },
                    ],
                  },
                  {
                    id: 'r-2',
                    name: 'Operador',
                    key: 'operator',
                    permissions: [
                      {
                        id: 'perm-3',
                        action: 'read',
                        subject_class: 'Route',
                        app_module: {
                          id: 20,
                          name: 'Routes',
                          description: 'Routes management',
                          active: true,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }),
      });
    });

    await page.route('**/auth/logout', async (route) => {
      logoutCalled = true;
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      });
    });

    await page.goto('http://lacarolina.localhost:4567/');

    await page.waitForURL('**/login');

    await page.getByTestId('login-email').fill('user@example.com');
    await page.getByTestId('login-password').fill('Password1!');
    await page.getByTestId('login-submit').click();

    await page.waitForURL('**/dashboard');
    const currentUrl = new URL(page.url());
    expect(currentUrl.hostname).toContain('lacarolina');

    await expect(page.getByTestId('tenant-dashboard')).toBeVisible();

    await page.getByTestId('header-avatar-button').click();

    await expect(page.getByTestId('header-menu-logout')).toBeVisible();
    await page.getByTestId('header-menu-logout').click();

    expect(logoutCalled).toBe(true);

    await page.waitForURL(/\/login/);
    const finalUrl = new URL(page.url());
    expect(finalUrl.hostname).toBe('localhost');
    expect(finalUrl.pathname).toBe('/login');
  });
});
