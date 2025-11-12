import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('logs in, stores session data and redirects to dashboard', async ({ page, context }) => {
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

    await page.route('**/me', async (route) => {
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

    const ls = await page.evaluate(() => {
      return {
        expiresAt: localStorage.getItem('userTokenExpiresAt'),
        idle: localStorage.getItem('userIdleTimeout'),
      };
    });

    expect(ls.expiresAt).not.toBeNull();
    expect(ls.idle).toBe('15');

    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === 'auth_token');
    expect(authCookie).toBeTruthy();
    expect(authCookie?.value).toBe('fake-jwt-value');
  });
});
