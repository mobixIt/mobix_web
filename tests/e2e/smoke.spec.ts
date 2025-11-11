import { test, expect } from '@playwright/test';

test('home carga', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/./);
  await expect(page).toHaveURL(/\/$/);
});
