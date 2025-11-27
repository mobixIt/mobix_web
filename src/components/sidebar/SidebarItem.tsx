'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ListItemButton,
  ListItemButtonProps,
  ListItemIconProps,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add } from '@mui/icons-material';
import type { NavItem } from './types';

interface SidebarItemProps {
  item: NavItem;
  active: boolean;
  onClick: (key: NavItem['key'], isActive: boolean) => void;
}

interface StyledListItemButtonProps extends ListItemButtonProps {
  $active?: boolean;
}

interface StyledListItemIconProps extends ListItemIconProps {
  $active?: boolean;
}

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== '$active',
})<StyledListItemButtonProps>(({ theme, $active }) => ({
  borderRadius: 0,
  marginInline: 0,
  marginBottom: theme.spacing(0.5),

  color: theme.palette.grey[400],

  transition: `
    background-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease
  `,

  ...( $active && {
    backgroundColor: `${theme.palette.secondary.main}10`,
    color: theme.palette.secondary.main,
    
    '.sidebar-icon': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    }
  }),

  '&:hover': {
    backgroundColor: `${theme.palette.secondary.main}10`,
    color: theme.palette.secondary.main,
  },

  '&:hover .sidebar-icon': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    transform: 'scale(1.1)',
  },

  '.sidebar-icon': {
    borderRadius: 4,
    padding: 2,

    transitionProperty: 'transform, background-color, color',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== '$active',
})<StyledListItemIconProps>(({ theme, $active }) => ({
  minWidth: 40,
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  backgroundColor: `${theme.palette.secondary.main}20`,
  color: theme.palette.secondary.main,
  marginRight: 16,
  ...( $active && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
  }),
}));

const StyledListItemText = styled(ListItemText)(() => ({
  '& .MuiListItemText-primary': {
    fontWeight: 500,
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: 8,
  },
}));

export default function SidebarItem({ item, active, onClick }: SidebarItemProps) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      onClick(item.key, active);
    } else {
      onClick(item.key, active);
    }
  };

  const content = (
    <StyledListItemButton
      $active={active}
      onClick={handleClick}
    >
      <StyledListItemIcon className="sidebar-icon" $active={active}>
        <Icon />
      </StyledListItemIcon>

      <StyledListItemText primary={item.label} />

      {item.action && (
        <Tooltip title={item.action.label}>
          <ActionIconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.action?.onClick();
            }}
          >
            <Add fontSize="small" />
          </ActionIconButton>
        </Tooltip>
      )}

      {typeof item.badge === 'number' && (
        <StyledBadge color="success" badgeContent={item.badge} />
      )}
    </StyledListItemButton>
  );

  if (!hasChildren && item.href) {
    return (
      <Link href={item.href}>
        {content}
      </Link>
    );
  }

  return content;
}