'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { ChevronLeft, Search, Add } from '@mui/icons-material';
import { FLYOUT_WIDTH, SIDEBAR_WIDTH } from './constants';
import { NavItem } from './types';

interface FlyoutProps {
  parent?: NavItem;
  open: boolean;
  onClose: () => void;
}

export default function Flyout({ parent, open, onClose }: FlyoutProps) {
  if (!open || !parent?.children?.length) return null;

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open
      slotProps={{
        paper: {
          sx: {
            position: 'absolute',
            left: SIDEBAR_WIDTH,
            width: FLYOUT_WIDTH,
            border: 0,
            boxShadow: '4px 0 8px rgba(0,0,0,0.05)',
            p: 2,
            mt: 1,
            height: '100%',
            margin: 0,
          },
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, pb: 1 }}>
        <IconButton size="small" onClick={onClose}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" fontWeight={800}>
          {parent.label}
        </Typography>
      </Box>

      {/* Buscador */}
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
        sx={{ mb: 2, mx: 1 }}
      />

      {/* Lista de opciones */}
      <List sx={{ px: 1 }}>
        {parent.children.map((child) => (
          <ListItemButton
            key={child.href}
            component={Link}
            href={child.href}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemText primary={child.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Acción opcional */}
      {parent.key === 'reports' && (
        <Box sx={{ mt: 'auto', px: 1 }}>
          <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  color="success"
                >
                  Create new report
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Drag and drop
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Drawer>
  );
}