import { test, expect, type Page } from '@playwright/test';

const DASHBOARD_URL = '/dashboard';
const APP_DOMAIN = 'localhost';

async function seedSessionStorage(
  page: Page,
  {
    idleMinutes = 0.01,
    expiresInSeconds = 60,
  }: { idleMinutes?: number; expiresInSeconds?: number } = {},
) {
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;

  await page.addInitScript((args) => {
    window.localStorage.setItem('userTokenExpiresAt', String(args.expiresAtMs));
    window.localStorage.setItem('userIdleTimeout', String(args.idleMinutes));
  }, { expiresAtMs, idleMinutes });
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
  await seedSessionStorage(page, { idleMinutes: 0.01, expiresInSeconds: 60 });
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

  await seedSessionStorage(page, { idleMinutes: 0.55, expiresInSeconds: 60 });
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
  await seedSessionStorage(page, { idleMinutes: 0.1, expiresInSeconds: 60 });

  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.waitForTimeout(200);

  await page.mouse.move(10, 10);

  await page.waitForTimeout(1_500);

  await expect(page).not.toHaveURL(/\/login/);
});

test('refreshes token shortly before expiration when user is active', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    const newExpiresAt = new Date(Date.now() + 60_000).toISOString(); // +60s
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

  await seedSessionStorage(page, {
    idleMinutes: 2,
    expiresInSeconds: 10,
  });
  await seedAuthCookie(page);

  await page.goto(DASHBOARD_URL);

  await page.mouse.move(20, 20);

  await page.waitForTimeout(5_000);

  await expect(page).not.toHaveURL(/\/login/);
});
