import { type Page } from '@playwright/test';
import { setActiveIdleCookie } from './idle-cookie';
import type { Permission, TenantModule } from '@/types/access-control';

export async function mockAppAuth(page: Page, tenantSlug: string, permissions: Permission[]) {
  await setActiveIdleCookie(page);

  const vehiclesModule: TenantModule = {
    id: 100, active: true, name: 'Vehicles', key: 'vehicles',
    strategies: [{ id: 1, default: true, strategy_id: 10, name: 'Base', key: 'base' }]
  };

  const membershipResponse = {
    data: {
      id: 1, first_name: 'E2E', last_name: 'User', email: 'test@mobix.test', phone: null,
      memberships: [{
        id: 1, active: true,
        tenant: { 
          id: 1, slug: tenantSlug, 
          client: { id: 1, name: 'Coolitoral', short_name: 'CLTL', country_code: 'CO', logo_url: '' },
          modules: [vehiclesModule] 
        },
        roles: [{
          id: 10, name: 'Manager', key: 'manager',
          tenant_permissions: permissions.map(p => ({ ...p, allow_attributes: [], deny_attributes: [] })),
          permissions
        }]
      }]
    }
  };

  await page.route('**/auth/me**', route => route.fulfill({ status: 200, body: JSON.stringify({ data: membershipResponse.data }) }));
  await page.route('**/auth/membership**', route => route.fulfill({ status: 200, body: JSON.stringify(membershipResponse) }));
}
