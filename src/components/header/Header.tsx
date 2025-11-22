'use client';

import * as React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { NotificationsNone } from '@mui/icons-material';

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 64,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        px: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Tooltip title="Notificaciones">
        <IconButton size="small">
          <NotificationsNone fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
