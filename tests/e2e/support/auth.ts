import { setActiveIdleCookie } from './idle-cookie';
import type { Page, Route } from '@playwright/test';
import type { AuthMeResponse, TenantPermission } from './auth.types';

export async function mockAuthenticatedTenantUser(
  page: Page,
  tenantSlug: string,
  permissions: TenantPermission[] = [],
): Promise<void> {
  await setActiveIdleCookie(page);

  await page.route('**/auth/me**', async (route: Route) => {
    const body: AuthMeResponse = {
      data: {
        id: 'user-1',
        first_name: 'Test',
        last_name: 'User',
        email: 'user@example.com',
        phone: null,
        memberships: [
          {
            id: 'm-1',
            active: true,
            tenant: { id: 't-1', slug: tenantSlug },
            roles: [],
            tenant_permissions: permissions,
            permissions: [],
          },
        ],
      },
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.route('**/auth/membership**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-1',
          first_name: 'Test',
          last_name: 'User',
          email: 'user@example.com',
          phone: null,
          memberships: [
            {
              id: 1,
              active: true,
              tenant: { id: 1, slug: tenantSlug, client: { name: 'Tenant', logo_url: '' } },
              tenant_permissions: permissions,
              roles: [
                {
                  id: 10,
                  name: 'Manager',
                  key: 'manager',
                  tenant_permissions: permissions,
                  permissions,
                },
              ],
            },
          ],
        },
      }),
    });
  });

  await page.route('**/auth/refresh**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          idle_timeout_minutes: 15,
        },
      }),
    });
  });
}
