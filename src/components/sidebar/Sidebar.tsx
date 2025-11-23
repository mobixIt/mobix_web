'use client';

import * as React from 'react';
import { Box, Drawer, Divider, List } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

import { SIDEBAR_WIDTH, NAV_ITEMS } from './constants';
import type { NavItem, NavChild } from './types';
import SidebarItem from './SidebarItem';
import Flyout from './Flyout';
import UserCard from './UserCard';

import { selectEffectiveModules } from '@/store/slices/permissionsSlice';
import type { EffectiveModule, Membership } from '@/types/access-control';
import { selectCurrentPerson } from '@/store/slices/authSlice';
import {
  TenantSwitcher,
  TenantOption,
} from '@/components/header/TenantSwitcher';
import { buildTenantUrl } from '@/utils/tenantUrl';

export function hasModuleAccess(
  modules: EffectiveModule[],
  requiredModuleName?: string | string[],
): boolean {
  if (!requiredModuleName) return true;

  const requiredList = Array.isArray(requiredModuleName)
    ? requiredModuleName.map((m) => m.toLowerCase())
    : [requiredModuleName.toLowerCase()];

  // Visible si el usuario tiene al menos uno de los módulos requeridos
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

function navItemMatchesPath(item: NavItem | NavChild, pathname: string): boolean {
  if (item.href && pathname.startsWith(item.href)) {
    return true;
  }

  if (item.children?.length) {
    return item.children.some((child) => navItemMatchesPath(child, pathname));
  }

  return false;
}

export default function Sidebar() {
  const pathname = usePathname();

  const effectiveModules = useSelector(
    selectEffectiveModules,
  ) as EffectiveModule[];

  const person = useSelector(selectCurrentPerson);

  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<NavItem | undefined>(
    undefined,
  );

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
        name: membership.tenant.slug ?? membership.tenant.slug,
        slug: membership.tenant.slug,
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

  React.useEffect(() => {
    const found = navItems.find((item) => navItemMatchesPath(item, pathname));
    setActiveItem(found);
    setFlyoutOpen(Boolean(found?.children?.length));
  }, [pathname, navItems]);

  const handleItemClick = (key: NavItem['key']) => {
    const item = navItems.find((i) => i.key === key);
    setActiveItem(item);
    setFlyoutOpen(Boolean(item?.children?.length));
  };

  const displayName = person
    ? `${person.first_name} ${person.last_name}`.trim()
    : 'Usuario';
  const displayEmail = person?.email ?? '';

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        bgcolor: (t) => t.palette.grey[50],
      }}
    >
      <Drawer
        variant="permanent"
        slotProps={{
          paper: {
            sx: {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 0,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              px: 0,
              py: 1,
              bgcolor: 'background.paper',
              gap: 0,
            },
          },
        }}
      >
        {tenantOptions.length > 0 && currentTenant && (
          <Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
            <TenantSwitcher
              currentTenant={currentTenant}
              tenants={tenantOptions}
              onChange={handleTenantChange}
            />
          </Box>
        )}

        <List sx={{ flex: 1 }}>
          {navItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              active={activeItem?.key === item.key}
              onClick={handleItemClick}
            />
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <UserCard
          name={displayName}
          email={displayEmail}
          avatarUrl={undefined}
          onMenuClick={() => console.log('Menú usuario')}
        />
      </Drawer>

      {/* Flyout */}
      <Flyout
        parent={activeItem}
        open={flyoutOpen}
        onClose={() => setFlyoutOpen(false)}
      />
    </Box>
  );
}
