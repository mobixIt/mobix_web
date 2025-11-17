import { test, expect, type Page } from '@playwright/test';

const DASHBOARD_URL = '/dashboard';
const APP_DOMAIN = 'localhost';

export async function seedSessionCookie(
  page: Page,
  {
    idleMinutes = 0.01,
    expiresInSeconds = 60,
  }: { idleMinutes?: number; expiresInSeconds?: number } = {},
) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const meta = {
    last_activity_at: Date.now(),
    idle_timeout_minutes: idleMinutes,
    expires_at: expiresAt,
  };

  const cookieValue = encodeURIComponent(JSON.stringify(meta));

  await page.addInitScript((cookie) => {
    document.cookie =
      `mobix_idle_meta=${cookie}; Path=/; SameSite=Lax`;
  }, cookieValue);
}

async function seedAuthCookie(page: Page) {
  await page.context().addCookies([
    {
      name: 'auth_token',
      value: 'fake-jwt-for-tests',
      domain: APP_DOMAIN,
      path: '/',
      httpOnly: true,
      secure: false,
    },
  ]);
}

test('logs out to /login when idle time elapses', async ({ page }) => {
  await seedSessionCookie(page, { idleMinutes: 0.01, expiresInSeconds: 60 });
  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.waitForTimeout(2_000);

  await expect(page).toHaveURL(/\/login/);
});

test('shows the idle modal and staying active resets the idle timer', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    const newExpiresAt = new Date(Date.now() + 60_000).toISOString(); // +60s
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          expires_at: newExpiresAt,
          idle_timeout_minutes: 0.55,
        }
      }),
    });
  });

  await seedSessionCookie(page, { idleMinutes: 0.55, expiresInSeconds: 60 });
  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  const modal = page.getByRole('heading', { name: '¿Sigues ahí?' });
  await expect(modal).toBeVisible({ timeout: 5_000 });

  await page.getByRole('button', { name: 'Continuar sesión' }).click();
  await expect(modal).toBeHidden();

  await page.waitForTimeout(1_500);
  await expect(page).not.toHaveURL(/\/login/);
});

test('resets idle timer on user activity (mousemove)', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    const newExpiresAt = new Date(Date.now() + 60_000).toISOString();
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          expires_at: newExpiresAt,
          idle_timeout_minutes: 0.55,
        }
      }),
    });
  });

  await seedSessionCookie(page, { idleMinutes: 0.1, expiresInSeconds: 60 });

  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.waitForTimeout(200);

  await page.mouse.move(10, 10);

  await page.waitForTimeout(1_500);

  await expect(page).not.toHaveURL(/\/login/);
});

test('refreshes token shortly before expiration when user is active', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    const newExpiresAt = new Date(Date.now() + 60_000).toISOString();
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          expires_at: newExpiresAt,
          idle_timeout_minutes: 2,
        },
      }),
    });
  });

  await seedSessionCookie(page, {
    idleMinutes: 2,
    expiresInSeconds: 10,
  });
  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.mouse.move(20, 20);

  await page.waitForTimeout(5_000);

  await expect(page).not.toHaveURL(/\/login/);
});

test('when no expiresAt is found and refresh fails, it logs out and redirects to /login', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errors: [
          {
            code: 'SESSION_NOT_FOUND',
            detail: 'Session could not be refreshed',
          },
        ],
      }),
    });
  });

  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.waitForURL(/\/login/, { timeout: 5_000 });
  await expect(page).toHaveURL(/\/login/);

  const ls = await page.evaluate(() => ({
    expiresAt: localStorage.getItem('userTokenExpiresAt'),
    idle: localStorage.getItem('userIdleTimeout'),
  }));

  expect(ls.expiresAt).toBeNull();
  expect(ls.idle).toBeNull();
});

test('logs out from tenant subdomain to base /login when idle time elapses', async ({ page }) => {
  await seedSessionCookie(page, { idleMinutes: 0.01, expiresInSeconds: 60 });

  await page.context().addCookies([
    {
      name: 'auth_token',
      value: 'fake-jwt-for-tests',
      domain: 'coolitoral.localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    },
  ]);

  await page.goto('http://coolitoral.localhost:4567/dashboard');

  await page.waitForTimeout(2_000);

  const finalUrl = new URL(page.url());
  expect(finalUrl.hostname).toBe('localhost');
  expect(finalUrl.pathname).toBe('/login');

  const ls = await page.evaluate(() => ({
    expiresAt: localStorage.getItem('userTokenExpiresAt'),
    idle: localStorage.getItem('userIdleTimeout'),
  }));

  expect(ls.expiresAt).toBeNull();
  expect(ls.idle).toBeNull();
});

test('when no idle cookie is found, it logs out and redirects to /login', async ({ page }) => {
  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.waitForURL(/\/login/, { timeout: 5_000 });
  await expect(page).toHaveURL(/\/login/);

  const meta = await page.evaluate(() => {
    const all = document.cookie?.split('; ') ?? [];
    return all.find((c) => c.startsWith('mobix_idle_meta=')) ?? null;
  });

  expect(meta).toBeNull();
});