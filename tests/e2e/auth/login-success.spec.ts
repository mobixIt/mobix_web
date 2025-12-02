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

  test('logs in, stores session data and redirects to first tenant dashboard', async ({ page }) => {
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

    await page.getByTestId('login-email').fill('user@example.com');
    await page.getByTestId('login-password').fill('Password1!');
    await page.getByTestId('login-submit').click();

    await page.waitForURL('http://coolitoral.localhost:4567/dashboard', {
      timeout: 5_000,
    });
    await expect(page).toHaveURL(
      'http://coolitoral.localhost:4567/dashboard',
    );

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
    await page.route('**://coolitoral.localhost:4567/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head><title>Coolitoral dashboard (mock)</title></head>
            <body>
              <div data-testid="person-dashboard">
                <h1>Bienvenido, Harold Rangel</h1>
              </div>
            </body>
          </html>
        `,
      });
    });

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

    await page.getByTestId('login-email').fill('user@example.com');
    await page.getByTestId('login-password').fill('Password1!');
    await page.getByTestId('login-submit').click();

    await page.waitForURL('http://coolitoral.localhost:4567/dashboard', {
      timeout: 5_000,
    });

    await expect(page).toHaveURL('http://coolitoral.localhost:4567/dashboard');
    await expect(page.getByTestId('person-dashboard')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Bienvenido,\s*Harold Rangel/i }),
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

    await page.getByTestId('login-email').fill('single@tenant.test');
    await page.getByTestId('login-password').fill('Password1!');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('http://coolitoral.localhost:4567/dashboard');
  });
});
