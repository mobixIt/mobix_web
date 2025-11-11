'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ListItemButton,
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

export default function SidebarItem({ item, active, onClick }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <ListItemButton
      key={item.key}
      onClick={() => onClick(item.key)}
      onMouseEnter={() => onClick(item.key)}
      component={item.href ? Link : 'button'}
      href={item.href || undefined}
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
        primaryTypographyProps={{ fontWeight: 600 }}
      />

      {item.action && (
        <Tooltip title={item.action.label}>
          <IconButton
            size="small"
            sx={{ mr: 1 }}
            onClick={(e) => {
              e.preventDefault(); // evitar que navegue
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