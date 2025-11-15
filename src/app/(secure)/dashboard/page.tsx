import { PersonDashboard } from '@/components/dashboard/PersonDashboard';
import { TenantDashboard } from '@/components/dashboard/TenantDashboard';
import { getTenantFromHost } from '@/lib/getTenantFromHost';

export default async function DashboardPage() {
  const tenantSlug = await getTenantFromHost();

  return (
    <main data-testid="global-dashboard">
      {tenantSlug ? (
        <TenantDashboard tenantSlug={tenantSlug} />
      ) : (
        <PersonDashboard />
      )}
    </main>
  );
}