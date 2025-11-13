import { test, expect } from '@playwright/test';

test.describe('Root page when unauthenticated', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('displays the login form', async ({ page }) => {
    await page.goto('/');

    await page.waitForURL('**/login', { timeout: 5_000 });

    await expect(
      page.getByRole('heading', { name: 'Iniciar sesión', exact: true })
    ).toBeVisible();

    await expect(page.getByLabel('ID ó Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByRole('link', { name: '¿Olvidó su contraseña?' })).toBeVisible();
  });
});
