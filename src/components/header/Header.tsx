'use client';

import * as React from 'react';
import { Box, IconButton, Tooltip, Stack } from '@mui/material';
import { Settings, NotificationsNone, StarOutline, Translate } from '@mui/icons-material';

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
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Tooltip title="Change language">
          <IconButton size="small">
            <Translate fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Preferences">
          <IconButton size="small">
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Favorites">
          <IconButton size="small">
            <StarOutline fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton size="small">
            <NotificationsNone fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}