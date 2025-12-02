import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const LOGIN_URL = '**/auth/login';

async function fillLoginForm(page: Page) {
  await page.goto('/');

  await page.waitForURL('**/login', { timeout: 5_000 });

  await page.getByTestId('login-email').fill('user@example.com');
  await page.getByTestId('login-password').fill('Password1!');
  await page.getByTestId('login-submit').click();
}

test.describe('Login error handling', () => {
  test('shows error when credentials are invalid', async ({ page }) => {
    await page.route(LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [
            {
              code: 'INVALID_CREDENTIALS',
              title: 'Invalid credentials',
              detail: 'Email or password is incorrect',
            },
          ],
        }),
      });
    });

    await fillLoginForm(page);

    const errorAlert = page
      .getByRole('alert')
      .filter({ hasText: /Credenciales inválidas/i });
    await expect(errorAlert).toBeVisible();
  });

  test('shows error when user has no memberships', async ({ page }) => {
    await page.route(LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [
            {
              code: 'NO_MEMBERSHIP',
              title: 'User has no memberships',
              detail: 'User has no memberships',
            },
          ],
        }),
      });
    });

    await fillLoginForm(page);

    const errorAlert = page
      .getByRole('alert')
      .filter({ hasText: /no tiene membresías activas/i });
    await expect(errorAlert).toBeVisible();
  });

  test('shows error when user has no active tenant', async ({ page }) => {
    await page.route(LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [
            {
              code: 'NO_ACTIVE_TENANT',
              title: 'User has no active memberships',
              detail: 'User has no active memberships',
            },
          ],
        }),
      });
    });

    await fillLoginForm(page);

    const errorAlert = page
      .getByRole('alert')
      .filter({ hasText: /empresas activas asociadas/i });
    await expect(errorAlert).toBeVisible();
  });

  test('shows error when session is already active', async ({ page }) => {
    await page.route(LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [
            {
              code: 'SESSION_ALREADY_ACTIVE',
              title: 'Session already active',
              detail: 'Session already active',
            },
          ],
        }),
      });
    });

    await fillLoginForm(page);

    const errorAlert = page
      .getByRole('alert')
      .filter({ hasText: /tienes una sesión activa/i });
    await expect(errorAlert).toBeVisible();
  });

  test('shows error when user has no authorized memberships (no roles/permissions)', async ({ page }) => {
    await page.route(LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [
            {
              code: 'NO_AUTHORIZED_MEMBERSHIPS',
              title: 'No authorized memberships',
              detail: 'User does not belong to any authorized membership',
            },
          ],
        }),
      });
    });

    await fillLoginForm(page);

    const errorAlert = page
      .getByRole('alert')
      .filter({
        hasText: /roles o permisos activos/i,
      });

    await expect(errorAlert).toBeVisible();
  });
});
