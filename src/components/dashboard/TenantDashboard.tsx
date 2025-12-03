'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  loadTenantPermissions,
  selectPermissionsLoading,
  selectPermissionsError,
  selectMembershipRaw,
} from '@/store/slices/permissionsSlice';

import { fetchMe, selectCurrentPerson } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';

type TenantDashboardProps = {
  tenantSlug: string;
};

export function TenantDashboard({ tenantSlug }: TenantDashboardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectPermissionsLoading);
  const error = useSelector(selectPermissionsError);
  const membershipResponse = useSelector(selectMembershipRaw);
  const person = useSelector(selectCurrentPerson);

  useEffect(() => {
    const loadAll = async () => {
      await dispatch(fetchMe());
      await dispatch(loadTenantPermissions(tenantSlug));
    };

    loadAll();
  }, [tenantSlug, dispatch]);

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

  if (!membership) {
    return (
      <section data-testid="tenant-dashboard" className="p-4">
        <header>
          <h2>Tenant Dashboard: {tenantSlug}</h2>
          <p data-testid="current-person-name">
            {person?.first_name} {person?.last_name}
          </p>
          <p data-testid="current-person-email">{person?.email}</p>
        </header>

        <div data-testid="current-membership-none">
          <p>No membership found for this tenant.</p>
        </div>
      </section>
    );
  }

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
          Tenant: {membership.tenant.slug} (ID: {membership.tenant.id})
        </p>

        <h3>Roles</h3>
        <ul data-testid="current-membership-roles">
          {membership.roles.map((role) => (
            <li key={role.id}>
              {role.name} ({role.key})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
