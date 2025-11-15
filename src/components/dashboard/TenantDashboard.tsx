'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';

import { fetchUserMembership } from '@/services/userAuthService';
import type { ApiErrorResponse } from '@/types/api';
import type { MembershipResponse } from '@/types/auth';

type TenantDashboardProps = {
  tenantSlug: string;
};

type MembershipError = {
  code: string;
  title: string;
  detail: string;
};

export function TenantDashboard({ tenantSlug }: TenantDashboardProps) {
  const [person, setPerson] = useState<MembershipResponse | null>(null);
  const [error, setError] = useState<MembershipError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchUserMembership(tenantSlug);
        if (!cancelled) {
          setPerson(result.data);
          setError(null);
        }
      } catch (e) {
        const err = e as AxiosError<ApiErrorResponse>;
        const apiError = err?.response?.data?.errors?.[0];

        if (!cancelled) {
          setError({
            code: apiError?.code ?? 'UNKNOWN_ERROR',
            title: apiError?.title ?? 'Dashboard error',
            detail:
              apiError?.detail ??
              'Something went wrong while loading memberships.',
          });
          setPerson(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  if (loading) {
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

  if (!person) {
    return (
      <section data-testid="tenant-dashboard-error" className="p-4">
        <h2>Tenant Dashboard: {tenantSlug}</h2>
        <p>Could not load membership data.</p>
      </section>
    );
  }

  const membership = person.memberships.find(
    (m) => m.tenant.slug === tenantSlug
  );

  return (
    <section data-testid="tenant-dashboard" className="p-4">
      <header>
        <h2>Tenant Dashboard: {tenantSlug}</h2>
        <p data-testid="current-person-name">
          {person.first_name} {person.last_name}
        </p>
        <p data-testid="current-person-email">{person.email}</p>
      </header>

      {membership ? (
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
      ) : (
        <div data-testid="current-membership-none">
          <p>No membership found for this tenant.</p>
        </div>
      )}
    </section>
  );
}
