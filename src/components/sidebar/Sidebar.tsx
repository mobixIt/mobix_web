'use client';

import * as React from 'react';
import { Box, Drawer, Divider, List } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

import { SIDEBAR_WIDTH, NAV_ITEMS } from './constants';
import type { NavItem, NavChild } from './types';
import BrandMark from './BrandMark';
import SidebarItem from './SidebarItem';
import Flyout from './Flyout';
import UserCard from './UserCard';

import {
  selectEffectiveModules,
} from '@/store/slices/permissionsSlice';
import type { EffectiveModule } from '@/types/access-control';

import { selectCurrentPerson } from '@/store/slices/authSlice';

export function hasModuleAccess(
  modules: EffectiveModule[],
  requiredModuleName?: string,
): boolean {
  if (!requiredModuleName) return true;

  const target = requiredModuleName.toLowerCase();
  return modules.some((m) => m.appModuleName.toLowerCase() === target);
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

export function buildNavItemsForUser(
  items: NavItem[],
  modules: EffectiveModule[],
): NavItem[] {
  const mapped: Array<NavItem | null> = items.map((item) => {
    if (
      (item.requiredModuleName &&
        !hasModuleAccess(modules, item.requiredModuleName)) ||
      !hasSubjectActionAccess(
        modules,
        item.requiredSubject,
        item.requiredAction,
      )
    ) {
      return null;
    }

    let children = item.children;

    if (children?.length) {
      children = children.filter((child) => {
        const moduleOk =
          !child.requiredModuleName ||
          hasModuleAccess(modules, child.requiredModuleName);

        const subjectOk = hasSubjectActionAccess(
          modules,
          child.requiredSubject,
          child.requiredAction,
        );

        return moduleOk && subjectOk;
      });
    }

    if (!item.href && (!children || children.length === 0)) {
      return null;
    }

    return { ...item, children } as NavItem;
  });

  return mapped.filter((item): item is NavItem => item !== null);
}

export default function Sidebar() {
  const pathname = usePathname();

  const effectiveModules = useSelector(selectEffectiveModules) as EffectiveModule[];

  const person = useSelector(selectCurrentPerson);

  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<NavItem | undefined>(
    undefined,
  );

  const navItems = React.useMemo(
    () => buildNavItemsForUser(NAV_ITEMS, effectiveModules),
    [effectiveModules],
  );

  React.useEffect(() => {
    const found = navItems.find((item) =>
      item.href
        ? pathname.startsWith(item.href)
        : item.children?.some((c: NavChild) => pathname.startsWith(c.href)),
    );
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
        <BrandMark />

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
