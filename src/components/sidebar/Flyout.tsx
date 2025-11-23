'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Slide,
} from '@mui/material';
import { ChevronLeft, Search } from '@mui/icons-material';
import { SIDEBAR_WIDTH, FLYOUT_WIDTH } from './constants';
import type { NavItem, NavChild } from './types';

interface FlyoutProps {
  parent?: NavItem;
  open: boolean;
  onClose: () => void;
}

export default function Flyout({ parent, open, onClose }: FlyoutProps) {
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
      <Box
        ref={ref}
        sx={(theme) => ({
          position: 'fixed',
          top: 0,
          left: SIDEBAR_WIDTH,
          width: FLYOUT_WIDTH,
          height: '100vh',
          bgcolor: 'background.paper',
          boxShadow: '4px 0 18px rgba(15, 23, 42, 0.15)',
          p: 2,
          zIndex: theme.zIndex.drawer - 1,
          overflowY: 'auto',
          borderRadius: '0 16px 16px 0',
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2 }}>
          <IconButton size="small" onClick={onClose}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight={800}>
            {parent.label}
          </Typography>
        </Box>

        <TextField
          fullWidth
          placeholder="Search"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <List>
          {parent.children
            .filter(
              (child): child is NavChild & { href: string } => Boolean(child.href),
            )
            .map((child) => (
              <ListItemButton
                key={child.href}
                component={Link}
                href={child.href}
                sx={{ borderRadius: 2, mb: 0.5 }}
                onClick={onClose}
              >
                <ListItemText primary={child.label} />
              </ListItemButton>
            ))}
        </List>
      </Box>
    </Slide>
  );
}
