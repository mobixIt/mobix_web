'use client';
import { Box, Typography } from '@mui/material';

export default function BrandMark() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 2,
      }}
    >
      {/* Logo SVG */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          d="M6 3a3 3 0 0 1 3 3v12a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Zm9 0a3 3 0 0 1 3 3v7a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
          fill="currentColor"
        />
      </svg>

      {/* Nombre de la app */}
      <Typography variant="h6" fontWeight={700}>
        Numex
      </Typography>
    </Box>
  );
}