import React from 'react';
import { Paper, Stack, Typography, Button, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type AiNoResultsBannerProps = {
  tone?: 'info' | 'error';
  message?: string;
  hint?: string;
  note?: string;
  retryLabel?: string;
  clearLabel?: string;
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
};

export function AiNoResultsBanner({
  tone = 'info',
  message = 'No pude encontrar nada con lo que me diste. ¿Probamos con más detalle?',
  hint = 'Me ayudan detalles como marca, año o color.',
  note = 'Mostrando los últimos resultados mientras ajustas la búsqueda.',
  retryLabel = 'Intentar de nuevo',
  clearLabel = 'Ver todos',
  onRetry,
  onClear,
  className,
}: AiNoResultsBannerProps) {
  return (
    <Paper
      role="status"
      aria-live="polite"
      elevation={0}
      className={className}
      sx={(theme) => ({
        borderRadius: 2,
        border: `1px solid ${tone === 'error' ? theme.palette.error.light : theme.palette.info.light}`,
        backgroundColor: (tone === 'error' ? theme.palette.error.light : theme.palette.info.light) + '26',
        padding: theme.spacing(2),
      })}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          aria-hidden
          sx={(theme) => ({
            display: 'inline-flex',
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: tone === 'error' ? theme.palette.error.main : theme.palette.info.main,
            color: theme.palette.common.white,
            flexShrink: 0,
          })}
        >
          <InfoOutlinedIcon />
        </Box>

        <Stack spacing={1} flex={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hint}
          </Typography>
          {note ? (
            <Typography variant="body2" color="text.secondary">
              {note}
            </Typography>
          ) : null}

          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <Button variant="contained" size="small" onClick={onRetry}>
              {retryLabel}
            </Button>
            <Button variant="text" size="small" onClick={onClear}>
              {clearLabel}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default AiNoResultsBanner;
