'use client';

import * as React from 'react';
import { Avatar, Box, IconButton, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
}

export default function UserCard({
  name,
  email,
  avatarUrl,
  onMenuClick,
}: UserCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Avatar
        src={avatarUrl}
        alt={name}
        sx={{ width: 36, height: 36 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {email}
        </Typography>
      </Box>

      {/* Botón de opciones */}
      {onMenuClick && (
        <Box sx={{ ml: 'auto' }}>
          <IconButton size="small" onClick={onMenuClick}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}