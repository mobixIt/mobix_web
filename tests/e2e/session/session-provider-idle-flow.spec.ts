import { test, expect } from '@playwright/test';

type SessionIdleCookieMeta = {
  last_activity_at: number;
  idle_timeout_minutes: number;
  expires_at: number;
};

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://coolitoral.localhost:4567';

function buildIdleCookieValue(meta: SessionIdleCookieMeta): string {
  return encodeURIComponent(JSON.stringify(meta));
}

test('shows idle modal close to timeout and staying active keeps the session active', async ({ page, context }) => {
  const nowMs = Date.now();
  const cookieMeta: SessionIdleCookieMeta = {
    last_activity_at: nowMs - 40_000,
    idle_timeout_minutes: 1,
    expires_at: nowMs + 60_000,
  };

  await context.addCookies([
    {
      name: 'mobix_idle_meta',
      value: buildIdleCookieValue(cookieMeta),
      domain: 'coolitoral.localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'E2E',
          last_name: 'User',
          email: 'e2e@tenant.test',
          phone: null,
        },
      }),
    });
  });

  await page.route('**/auth/membership', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'E2E',
          last_name: 'User',
          email: 'e2e@tenant.test',
          phone: null,
          memberships: [
            {
              id: 1,
              active: true,
              tenant: { id: 1, slug: 'coolitoral', client: { name: 'Coolitoral', logo_url: '' } },
              roles: [],
            },
          ],
        },
      }),
    });
  });

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'commit' });

  await expect(page.getByTestId('tenant-dashboard')).toBeVisible();

  const idleModal = page.getByTestId('session-timeout-modal');
  await expect(idleModal).toBeVisible();

  const secondsBefore = await page.getByTestId('session-timeout-seconds').innerText();
  const secondsBeforeNumber = Number(secondsBefore);
  expect(secondsBeforeNumber).toBeGreaterThan(0);
  expect(secondsBeforeNumber).toBeLessThan(30);

  await page.getByTestId('session-timeout-stay-active').click();

  await expect(idleModal).not.toBeVisible();
});
