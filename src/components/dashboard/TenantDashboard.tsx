'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';

import { logoutUser } from '@/services/userAuthService';
import { redirectToBaseLogin } from '@/utils/redirectToLogin';

import {
  loadTenantPermissions,
  selectPermissionsLoading,
  selectPermissionsError,
  selectMembershipRaw,
} from '@/store/slices/permissionsSlice';
import type { AppDispatch } from '@/store/store';

type TenantDashboardProps = {
  tenantSlug: string;
};

export function TenantDashboard({ tenantSlug }: TenantDashboardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectPermissionsLoading);
  const error = useSelector(selectPermissionsError);
  const membershipResponse = useSelector(selectMembershipRaw);

  useEffect(() => {
    dispatch(loadTenantPermissions(tenantSlug));
  }, [tenantSlug, dispatch]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      redirectToBaseLogin();
    }
  };

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
        <p>Could not load membership data.</p>
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
            {membershipResponse.first_name} {membershipResponse.last_name}
          </p>
          <p data-testid="current-person-email">{membershipResponse.email}</p>
        </header>

        <div data-testid="current-membership-none">
          <p>No membership found for this tenant.</p>
        </div>

        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </section>
    );
  }

  const person = membershipResponse;

  return (
    <section data-testid="tenant-dashboard" className="p-4">
      <header>
        <h2>Tenant Dashboard: {tenantSlug}</h2>

        <p data-testid="current-person-name">
          {person.first_name} {person.last_name}
        </p>
        <p data-testid="current-person-email">{person.email}</p>
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

      <Button variant="outlined" color="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </section>
  );
}
