'use client';
import * as React from 'react';
import { Box, Drawer, Divider, List } from '@mui/material';
import { usePathname } from 'next/navigation';
import { SIDEBAR_WIDTH, NAV_ITEMS } from './constants';
import { NavItem, NavChild } from './types';
import BrandMark from './BrandMark';
import SidebarItem from './SidebarItem';
import Flyout from './Flyout';
import UserCard from './UserCard';

export default function Sidebar() {
  const pathname = usePathname();
  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<NavItem | undefined>(undefined);

  // Determinar ítem activo en base a la ruta
  React.useEffect(() => {
    const found = NAV_ITEMS.find(item =>
      item.href ? pathname.startsWith(item.href) :
        item.children?.some((c: NavChild) => pathname.startsWith(c.href))
    );
    setActiveItem(found);
    setFlyoutOpen(Boolean(found?.children?.length));
  }, [pathname]);

  const handleItemClick = (key: NavItem['key']) => {
    const item = NAV_ITEMS.find(i => i.key === key);
    setActiveItem(item);
    setFlyoutOpen(Boolean(item?.children?.length));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: (t) => t.palette.grey[50] }}>
      {/* Sidebar principal */}
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
          {NAV_ITEMS.map((item) => (
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
          name="Frederick Cale"
          email="fredcale@devius.com"
          avatarUrl="https://i.pravatar.cc/100?img=12"
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