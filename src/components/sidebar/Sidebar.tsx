'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

import { NAV_ITEMS } from './constants';
import type { NavItem, NavChild } from './types';
import SidebarView from './SidebarView';

import { selectEffectiveModules } from '@/store/slices/permissionsSlice';
import type { EffectiveModule, Membership } from '@/types/access-control';
import { selectCurrentPerson } from '@/store/slices/authSlice';
import type { TenantOption } from '@/components/sidebar/TenantSwitcher';
import { buildTenantUrl } from '@/utils/tenantUrl';

export function hasModuleAccess(
  modules: EffectiveModule[],
  requiredModuleName?: string | string[],
): boolean {
  if (!requiredModuleName) return true;

  const requiredList = Array.isArray(requiredModuleName)
    ? requiredModuleName.map((m) => m.toLowerCase())
    : [requiredModuleName.toLowerCase()];

  return modules.some((m) =>
    requiredList.includes(m.appModuleName.toLowerCase()),
  );
}

export function hasSubjectActionAccess(
  modules: EffectiveModule[],
  requiredSubject?: string,
  requiredAction?: string,
): boolean {
  if (!requiredSubject) return true;

  const allowedActions = modules.flatMap(
    (m) => m.actionsBySubject[requiredSubject] ?? [],
  );

  if (!requiredAction) {
    return allowedActions.length > 0;
  }

  return allowedActions.includes(requiredAction);
}

function filterNavChildRecursively(
  child: NavChild,
  modules: EffectiveModule[],
): NavChild | null {
  const moduleOk = hasModuleAccess(modules, child.requiredModuleName);
  const subjectOk = hasSubjectActionAccess(
    modules,
    child.requiredSubject,
    child.requiredAction,
  );

  if (!moduleOk || !subjectOk) {
    return null;
  }

  let children = child.children;

  if (children?.length) {
    children = children
      .map((nested) => filterNavChildRecursively(nested, modules))
      .filter((n): n is NavChild => n !== null);
  }

  if (!child.href && (!children || children.length === 0)) {
    return null;
  }

  return { ...child, children };
}

function filterNavItemRecursively(
  item: NavItem,
  modules: EffectiveModule[],
): NavItem | null {
  const moduleOk = hasModuleAccess(modules, item.requiredModuleName);
  const subjectOk = hasSubjectActionAccess(
    modules,
    item.requiredSubject,
    item.requiredAction,
  );

  if (!moduleOk || !subjectOk) {
    return null;
  }

  let children = item.children;

  if (children?.length) {
    children = children
      .map((child) => filterNavChildRecursively(child, modules))
      .filter((c): c is NavChild => c !== null);
  }

  if (!item.href && (!children || children.length === 0)) {
    return null;
  }

  return { ...item, children };
}

export function buildNavItemsForUser(
  items: NavItem[],
  modules: EffectiveModule[],
): NavItem[] {
  return items
    .map((item) => filterNavItemRecursively(item, modules))
    .filter((item): item is NavItem => item !== null);
}

export default function Sidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? '/';

  const effectiveModules = useSelector(
    selectEffectiveModules,
  ) as EffectiveModule[];

  const person = useSelector(selectCurrentPerson);

  const navItems = React.useMemo(
    () => buildNavItemsForUser(NAV_ITEMS, effectiveModules),
    [effectiveModules],
  );

  const memberships = React.useMemo(
    () => ((person?.memberships ?? []) as Membership[]),
    [person],
  );

  const tenantOptions: TenantOption[] = React.useMemo(
    () =>
      memberships.map((membership) => ({
        id: String(membership.tenant.id),
        name: membership.tenant.client?.name ?? membership.tenant.slug,
        slug: membership.tenant.slug,
        logoUrl: membership.tenant.client?.logo_url ?? '',
      })),
    [memberships],
  );

  const [currentTenant, setCurrentTenant] =
    React.useState<TenantOption | null>(null);

  React.useEffect(() => {
    if (!tenantOptions.length) {
      setCurrentTenant((prev) => (prev !== null ? null : prev));
      return;
    }

    const host =
      typeof window !== 'undefined' ? window.location.hostname : '';

    let fromHost: TenantOption | undefined;

    if (host && host.length > 0) {
      fromHost = tenantOptions.find((tenant) =>
        host.startsWith(`${tenant.slug}.`),
      );
    }

    const nextTenant = fromHost ?? tenantOptions[0];

    setCurrentTenant((prev) => {
      if (prev?.slug === nextTenant.slug) return prev;
      return nextTenant;
    });
  }, [tenantOptions]);

  const handleTenantChange = (tenant: TenantOption) => {
    if (!tenant || tenant.slug === currentTenant?.slug) return;

    const url = buildTenantUrl(tenant.slug);
    const dashboardUrl = `${url}/dashboard`;
    window.location.href = dashboardUrl;
  };

  return (
    <SidebarView
      navItems={navItems}
      pathname={pathname}
      tenantOptions={tenantOptions}
      currentTenant={currentTenant}
      onTenantChange={handleTenantChange}
    />
  );
}