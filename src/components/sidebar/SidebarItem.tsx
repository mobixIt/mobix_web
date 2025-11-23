'use client';

import * as React from 'react';
import Link, { LinkProps } from 'next/link';
import {
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { NavItem } from './types';

interface SidebarItemProps {
  item: NavItem;
  active: boolean;
  onClick: (key: NavItem['key']) => void;
}

type ButtonOrLinkProps =
  | (ListItemButtonProps & { component: 'button'; href?: never })
  | (ListItemButtonProps & { component: typeof Link; href: LinkProps['href'] });

export default function SidebarItem({ item, active, onClick }: SidebarItemProps) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  const componentProps: ButtonOrLinkProps =
    hasChildren || !item.href
      ? { component: 'button' }
      : { component: Link, href: item.href };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      onClick(item.key);
    } else {
      onClick(item.key);
    }
  };

  const handleMouseEnter = () => {
    if (hasChildren) {
      onClick(item.key);
    }
  };
  return (
    <ListItemButton
      key={item.key}
      {...componentProps}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      sx={{
        borderRadius: 2,
        mx: 1.5,
        mb: 0.5,
        ...(active && {
          bgcolor: 'success.light',
          '&:hover': { bgcolor: 'success.light' },
        }),
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: 'text.primary' }}>
        <Icon />
      </ListItemIcon>

      <ListItemText
        primary={item.label}
        slotProps={{
          primary: { sx: { fontWeight: 600 } },
        }}
      />

      {item.action && (
        <Tooltip title={item.action.label}>
          <IconButton
            size="small"
            sx={{ mr: 1 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.action?.onClick();
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {typeof item.badge === 'number' && (
        <Badge
          color="success"
          badgeContent={item.badge}
          sx={{ '& .MuiBadge-badge': { right: 8 } }}
        />
      )}
    </ListItemButton>
  );
}
