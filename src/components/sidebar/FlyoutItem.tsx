'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Collapse,
  List,
  ListItemButton,
  ListItemButtonProps,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { NavChild } from './types';
import { ExpandMore } from '@mui/icons-material';

const NestedRail = styled('div')(({ theme }) => ({
  position: 'relative',
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: theme.spacing(0.5),
    bottom: theme.spacing(0.5),
    width: 3,
    backgroundColor: theme.palette.secondary.main,
    zIndex: 100,
  },
}));

const NestedList = styled(List)(() => ({
  paddingTop: 0,
  paddingBottom: 0,
}));

interface StyledListItemProps extends ListItemButtonProps {
  $active?: boolean;
  $isNested?: boolean;
  $expanded?: boolean;
}

const StyledListItem = styled(ListItemButton, {
  shouldForwardProp: (prop) =>
    prop !== '$active' && prop !== '$isNested' && prop !== '$expanded',
})<StyledListItemProps>(({ theme, $active, $isNested, $expanded }) => ({
  position: 'relative',
  borderRadius: 4,
  marginBottom: theme.spacing(0.5),
  justifyContent: 'space-between',
  paddingInline: theme.spacing(1.5),
  alignItems: 'center',

  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.palette.grey[400],
  textDecoration: 'none',

  '&:hover': {
    backgroundColor: `${theme.palette.secondary.main}10`,
    color: theme.palette.primary.main,
  },

  '&:hover .flyout-icon': {
    color: theme.palette.secondary.main,
    transform: 'scale(1.05)',
  },

  ...( $active && {
    backgroundColor: `${theme.palette.secondary.main}10`,
    color: theme.palette.primary.main,
    '& .flyout-icon': {
      color: theme.palette.secondary.main,
    },
  }),

  ...( $isNested && {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: -16,
      top: 14,
      width: 12,
      height: 12,
      borderRadius: '0 0 0 10px',
      borderBottom: '2px solid',
      borderLeft: '2px solid',
      borderColor: $active
        ? theme.palette.secondary.main
        : theme.palette.primary.main,
    },
  }),

  '.flyout-arrow': {
    color: theme.palette.common.white,
    transform: 'rotate(0deg)',
    transition: 'transform 0.2s ease, color 0.2s ease',
  },

  ...( $expanded && {
    '.flyout-arrow': {
      color: theme.palette.common.white,
      transform: 'rotate(180deg)',
    },
  }),
}));

const NoUnderlineLink = styled(Link)(() => ({
  textDecoration: 'none',
}));

const LabelWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: theme.palette.grey[400],
}));

const IconWrapper = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: theme.palette.grey[400],
  transition: 'color 0.15s ease, transform 0.15s ease',
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    fontFamily: 'Roboto, sans-serif',
    color: theme.palette.grey[400],
  },
}));

function nodeIsActive(node: NavChild, pathname: string): boolean {
  if (node.href && pathname.startsWith(node.href)) return true;

  if (node.children?.length)
    return node.children.some((child) => nodeIsActive(child, pathname));

  return false;
}

export interface FlyoutItemProps {
  node: NavChild;
  onClose: () => void;
  pathname: string;
  depth?: number;
}

export default function FlyoutItem({
  node,
  onClose,
  pathname,
  depth = 0,
}: FlyoutItemProps) {
  const hasChildren = Boolean(node.children?.length);
  const hasHref = Boolean(node.href);

  const [open, setOpen] = React.useState(() =>
    hasChildren ? node.children!.some((child) => nodeIsActive(child, pathname)) : false,
  );

  const isActive = nodeIsActive(node, pathname) || (hasChildren && open);
  const isNested = depth > 0;
  const IconComponent = depth === 0 && node.icon ? node.icon : undefined;

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      setOpen((prev) => !prev);
      return;
    }

    onClose();
  };

  const button = (
    <StyledListItem
      onClick={handleClick}
      $active={isActive}
      $isNested={isNested}
      $expanded={open && hasChildren}
    >
      <LabelWrapper>
        {IconComponent && (
          <IconWrapper className="flyout-icon">
            <IconComponent fontSize="small" />
          </IconWrapper>
        )}

        <StyledListItemText primary={node.label} />
      </LabelWrapper>

      {hasChildren && (
        <ExpandMore className="flyout-arrow" />
      )}
    </StyledListItem>
  );

  if (!hasChildren && hasHref && node.href) {
    return (
      <NoUnderlineLink href={node.href}>
        {button}
      </NoUnderlineLink>
    );
  }

  return (
    <>
      {button}

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <NestedRail>
            <NestedList disablePadding>
              {node.children!.map((child) => (
                <FlyoutItem
                  key={child.label}
                  node={child}
                  onClose={onClose}
                  pathname={pathname}
                  depth={depth + 1}
                />
              ))}
            </NestedList>
          </NestedRail>
        </Collapse>
      )}
    </>
  );
}
