'use client';

import * as React from 'react';
import {
  IconButton,
  Typography,
  List,
  Slide,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronLeft } from '@mui/icons-material';

import { SIDEBAR_WIDTH, FLYOUT_WIDTH } from './constants';
import type { NavItem } from './types';
import FlyoutItem from './FlyoutItem';

interface FlyoutProps {
  parent?: NavItem;
  open: boolean;
  onClose: () => void;
  pathname: string;
}

const ArrowButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  transition: 'color 0.15s ease, transform 0.15s ease',

  '&:hover': {
    color: theme.palette.secondary.main,
    transform: 'scale(1.05)',
  },
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 800,
}));

const FlyoutContainer = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: SIDEBAR_WIDTH,
  width: FLYOUT_WIDTH,
  height: '100vh',
  backgroundColor: theme.palette.accent.main,
  boxShadow: '4px 0 18px rgba(15, 23, 42, 0.15)',
  padding: theme.spacing(2),
  zIndex: theme.zIndex.drawer - 1,
  overflowY: 'auto',
  borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
  display: 'flex',
  flexDirection: 'column',
}));

const HeaderRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingBottom: 16,
});

export default function Flyout({ parent, open, onClose, pathname }: FlyoutProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!parent?.children?.length) return null;

  return (
    <Slide
      direction="right"
      in={open}
      mountOnEnter
      unmountOnExit
      appear
      timeout={220}
    >
      <FlyoutContainer ref={ref}>
        <HeaderRow>
          <ArrowButton size="small" onClick={onClose}>
            <ChevronLeft />
          </ArrowButton>

          <HeaderTitle variant="h6">
            {parent.label}
          </HeaderTitle>
        </HeaderRow>

        <List disablePadding>
          {parent.children.map((child) => (
            <FlyoutItem
              key={child.label}
              node={child}
              onClose={onClose}
              pathname={pathname}
            />
          ))}
        </List>
      </FlyoutContainer>
    </Slide>
  );
}
