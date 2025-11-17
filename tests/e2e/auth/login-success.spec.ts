import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
            idle_timeout_minutes: 15
          }
        }),
      });
    });
  });

  test('logs in, stores session data and redirects to dashboard', async ({ page }) => {
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
            first_name: 'Test',
            last_name: 'User',
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

    await page.goto('/');

    await page.getByLabel('ID ó Correo electrónico', { exact: true }).fill('user@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('Password1!');
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();

    await page.waitForURL('**/dashboard', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/dashboard$/);

    const cookies = await page.context().cookies();
    const idleCookie = cookies.find((c) => c.name === 'mobix_idle_meta');

    expect(idleCookie).toBeDefined();

    const meta = JSON.parse(decodeURIComponent(idleCookie!.value));

    expect(meta.idle_timeout_minutes).toBe(15);
    const expiresMs =
      typeof meta.expires_at === 'number'
        ? meta.expires_at
        : new Date(meta.expires_at).getTime();

    expect(expiresMs).toBeGreaterThan(Date.now());
  });

  test('logs in, loads /auth/me into Redux and shows user name in dashboard', async ({ page }) => {
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

    await page.goto('/');

    await page.getByLabel('ID ó Correo electrónico', { exact: true }).fill('user@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('Password1!');
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();

    await page.waitForURL('**/dashboard', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.getByTestId('person-dashboard')).toBeVisible();

    await expect(
      page.getByRole('heading', { name: /Bienvenido,\s*Harold Rangel/i })
    ).toBeVisible();
  });

  test('redirects to tenant dashboard when user has a single membership', async ({ page }) => {
    await page.route('**://coolitoral.localhost:4567/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head><title>Coolitoral dashboard (mock)</title></head>
            <body>
              <h1>Coolitoral dashboard mock</h1>
            </body>
          </html>
        `,
      });
    });

    await page.route('**/auth/login', async (route) => {
      const json = {
        data: {
          expires_at: new Date(Date.now() + 3600_000).toISOString(),
          idle_timeout_minutes: 10,
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      });
    });

    await page.route('**/auth/me', async (route) => {
      const json = {
        data: {
          id: 'user-1',
          name: 'Single Tenant User',
          email: 'single@tenant.test',
          memberships: [
            {
              id: 'm-1',
              tenant: {
                id: 't-1',
                slug: 'coolitoral',
                name: 'Coolitoral',
              },
            },
          ],
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      });
    });

    await page.goto('http://www.localhost:4567/');

    await page.waitForURL('**/login');

    await page.getByLabel('ID ó Correo electrónico').fill('single@tenant.test');
    await page.getByLabel('Contraseña').fill('Password1!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('http://coolitoral.localhost:4567/dashboard');
  });

  test('stays on /dashboard and shows tenant switcher when user has multiple memberships', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            expires_at: new Date(Date.now() + 3600_000).toISOString(),
            idle_timeout_minutes: 10,
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
            id: 'user-2',
            name: 'Multi Tenant User',
            email: 'multi@tenant.test',
            memberships: [
              {
                id: 'm-1',
                tenant: { id: 't1', slug: 'coolitoral' },
              },
              {
                id: 'm-2',
                tenant: { id: 't2', slug: 'sobusa' },
              },
            ],
          },
        }),
      });
    });

    await page.goto('http://localhost:4567/');

    await page.getByLabel('ID ó Correo electrónico').fill('multi@tenant.test');
    await page.getByLabel('Contraseña').fill('Password1!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    const switcher = page.getByTestId('tenant-switcher');
    await expect(switcher).toBeVisible();

    await switcher.click();

    await expect(page.getByRole('option', { name: /coolitoral/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /sobusa/i })).toBeVisible();
  });

  test('selecting a tenant from the switcher redirects to the selected tenant subdomain', async ({ page }) => {
    await page.route('**://sobusa.localhost:4567/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head><title>Sobusa dashboard (mock)</title></head>
            <body>
              <h1>Sobusa dashboard mock</h1>
            </body>
          </html>
        `,
      });
    });

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            expires_at: new Date(Date.now() + 3600_000).toISOString(),
            idle_timeout_minutes: 10,
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
            id: 'user-2',
            name: 'Multi Tenant User',
            email: 'multi@tenant.test',
            memberships: [
              {
                id: 'm-1',
                tenant: { id: 't1', slug: 'coolitoral' },
              },
              {
                id: 'm-2',
                tenant: { id: 't2', slug: 'sobusa' },
              },
            ],
          },
        }),
      });
    });

    await page.goto('http://www.localhost:4567/');

    await page.getByLabel('ID ó Correo electrónico').fill('multi@tenant.test');
    await page.getByLabel('Contraseña').fill('Password1!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const switcher = page.getByTestId('tenant-switcher');

    await switcher.click();

    await page.getByRole('option', { name: /sobusa/i }).click();

    await expect(page).toHaveURL('http://sobusa.localhost:4567/dashboard');
  });
});
