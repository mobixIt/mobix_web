import { test, expect } from '@playwright/test';

test.describe('Logout flow', () => {
  test('logs out from person dashboard, clears session and redirects to /login', async ({ page }) => {
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
          },
        }),
      });
    });

    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            id: 1,
            first_name: 'Harold',
            last_name: 'Rangel',
            email: 'user@example.com',
            phone: null,
            memberships: [
              {
                id: 10,
                active: true,
                tenant: {
                  id: 99,
                  slug: 'coolitoral',
                },
              },
              {
                id: 'm-2',
                tenant: { id: 't2', slug: 'sobusa', name: 'Sobusa' },
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
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });
    });

    await page.goto('/');

    await page
      .getByLabel('ID ó Correo electrónico', { exact: true })
      .fill('user@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('Password1!');
    await page
      .getByRole('button', { name: 'Iniciar sesión', exact: true })
      .click();

    await page.waitForURL('**/dashboard', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.getByTestId('person-dashboard')).toBeVisible();

    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login$/);

    expect(logoutCalled).toBe(true);

    const lsAfter = await page.evaluate(() => ({
      expiresAt: localStorage.getItem('userTokenExpiresAt'),
      idle: localStorage.getItem('userIdleTimeout'),
    }));

    expect(lsAfter.expiresAt).toBeNull();
    expect(lsAfter.idle).toBeNull();
  });

  test('logs out from tenant dashboard, clears session and redirects to /login', async ({ page }) => {
    let logoutCalled = false;

    await page.addInitScript(() => {
      localStorage.setItem(
        'userTokenExpiresAt',
        String(Date.now() + 60 * 60 * 1000),
      );
      localStorage.setItem('userIdleTimeout', '15');
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
                  { id: 'r-1', name: 'Admin', key: 'admin' },
                  { id: 'r-2', name: 'Operador', key: 'operator' },
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

    await page.goto('http://lacarolina.local.mobix.fyi/dashboard');

    await expect(page.getByTestId('tenant-dashboard')).toBeVisible();

    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login$/);

    expect(logoutCalled).toBe(true);

    const lsAfter = await page.evaluate(() => ({
      expiresAt: localStorage.getItem('userTokenExpiresAt'),
      idle: localStorage.getItem('userIdleTimeout'),
    }));

    expect(lsAfter.expiresAt).toBeNull();
    expect(lsAfter.idle).toBeNull();
  });
});
