'use client';

import * as React from 'react';
import { Drawer, List, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

import { SIDEBAR_WIDTH } from './constants';
import type { NavItem, NavChild } from './types';
import SidebarItem from './SidebarItem';
import Flyout from './Flyout';
import type { TenantOption } from '@/components/header/TenantSwitcher';
import { TenantSwitcher } from '@/components/header/TenantSwitcher';

export type SidebarViewProps = {
  navItems: NavItem[];
  pathname: string;

  tenantOptions: TenantOption[];
  currentTenant: TenantOption | null;
  onTenantChange: (tenant: TenantOption) => void;
};

function navItemMatchesPath(item: NavItem | NavChild, pathname: string): boolean {
  if (item.href && pathname.startsWith(item.href)) {
    return true;
  }

  if (item.children?.length) {
    return item.children.some((child) => navItemMatchesPath(child, pathname));
  }

  return false;
}

const SidebarDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    border: 0,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    paddingInline: 0,
    paddingBlock: theme.spacing(1),
    backgroundColor: theme.palette.accent.main,
    gap: 0,
  },
}));

const TenantContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1.5),
}));

const NavList = styled(List)(() => ({
  flex: 1,
}));

export const StyledDivider = styled(Divider)(() => ({
  borderColor: "rgba(255, 255, 255, 0.1)",
  borderBottomWidth: 1,
}));

export function SidebarView({
  navItems,
  pathname,
  tenantOptions,
  currentTenant,
  onTenantChange,
}: SidebarViewProps) {
  const [activeItem, setActiveItem] = React.useState<NavItem | undefined>();
  const [flyoutOpen, setFlyoutOpen] = React.useState(false);

  React.useEffect(() => {
    const found = navItems.find((item) => navItemMatchesPath(item, pathname));
    setActiveItem(found);
  }, [pathname, navItems]);

  const handleItemClick = React.useCallback(
    (key: NavItem['key'], isActive: boolean) => {
      const item = navItems.find((i) => i.key === key);
      if (!item) return;

      const hasChildren = Boolean(item.children?.length);

      if (hasChildren) {
        if (isActive) {
          setFlyoutOpen((prev) => !prev);
          return;
        }

        setActiveItem(item);
        setFlyoutOpen(true);
        return;
      }

      setActiveItem(item);
      setFlyoutOpen(false);
    },
    [navItems]
  );

  return (
    <>
      <SidebarDrawer variant="permanent">
        {tenantOptions.length > 0 && currentTenant && (
          <TenantContainer>
            <TenantSwitcher
              currentTenant={currentTenant}
              tenants={tenantOptions}
              onChange={onTenantChange}
            />
          </TenantContainer>
        )}

        <StyledDivider />

        <NavList>
          {navItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              active={activeItem?.key === item.key}
              onClick={handleItemClick}
            />
          ))}
        </NavList>
      </SidebarDrawer>

      <Flyout
        parent={activeItem}
        open={flyoutOpen}
        onClose={() => setFlyoutOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

export default SidebarView;