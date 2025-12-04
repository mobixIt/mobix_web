'use client';

import { useSelector } from 'react-redux';

import {
  selectPermissionsLoading,
  selectPermissionsError,
  selectMembershipRaw,
} from '@/store/slices/permissionsSlice';

import { selectCurrentPerson } from '@/store/slices/authSlice';

type TenantDashboardProps = {
  tenantSlug: string;
};

export function TenantDashboard({ tenantSlug }: TenantDashboardProps) {

  const loading = useSelector(selectPermissionsLoading);
  const error = useSelector(selectPermissionsError);
  const membershipResponse = useSelector(selectMembershipRaw);
  const person = useSelector(selectCurrentPerson);

  if (loading || (!membershipResponse && !error)) {
    return (
      <section data-testid="tenant-dashboard-loading" className="p-4">
        Cargando información del tenant...
      </section>
    );
  }

  if (error) {
    return (
      <section data-testid="tenant-dashboard-error" className="p-4">
        <h2>Tenant Dashboard: {tenantSlug}</h2>
        <h3>{error.title}</h3>
        <p>
          <strong>{error.code}</strong>
        </p>
        <p>{error.detail}</p>
      </section>
    );
  }

  if (!membershipResponse) {
    return (
      <section data-testid="tenant-dashboard-error" className="p-4">
        <h2>Tenant Dashboard: {tenantSlug}</h2>
        <p>No se pudo obtener las membresías.</p>
      </section>
    );
  }

  const membership = membershipResponse.memberships.find(
    (m) => m.tenant.slug === tenantSlug,
  );

  return (
    <section data-testid="tenant-dashboard" className="p-4">
      <header>
        <h2>Tenant Dashboard: {tenantSlug}</h2>

        <p data-testid="current-person-name">
          {person?.first_name} {person?.last_name}
        </p>
        <p data-testid="current-person-email">{person?.email}</p>
      </header>

      <div data-testid="current-membership">
        <p>
          Tenant: {membership?.tenant.slug} (ID: {membership?.tenant.id})
        </p>

        <h3>Roles</h3>
        <ul data-testid="current-membership-roles">
          {membership?.roles.map((role) => (
            <li key={role.id}>
              {role.name} ({role.key})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
