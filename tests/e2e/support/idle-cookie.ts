import type { Page } from '@playwright/test';

export async function setActiveIdleCookie(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const meta = {
      last_activity_at: Date.now(),
      idle_timeout_minutes: 10,
      expires_at: Date.now() + 60 * 60 * 1000,
    };

    document.cookie =
      'mobix_idle_meta=' +
      encodeURIComponent(JSON.stringify(meta)) +
      '; path=/; SameSite=Lax';
  });
}
