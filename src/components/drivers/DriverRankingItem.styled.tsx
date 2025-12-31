'use client';

import { styled, alpha } from '@mui/material/styles';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import type { Theme } from '@mui/material/styles';

const getRankTone = (theme: Theme, rank: number) => {
  if (rank === 1) return theme.palette.warning.main;
  if (rank === 2) return theme.palette.grey[500] ?? '#9CA3AF';
  if (rank === 3) return '#EA580C';
  return theme.palette.grey[400];
};

export const DriverCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$rank',
})<{ $rank: number }>(({ theme, $rank }) => {
  const isTop3 = $rank >= 1 && $rank <= 3;
  const tone = getRankTone(theme, $rank);

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${isTop3 ? tone : alpha(theme.palette.grey[400], 0.3)}`,
    backgroundColor: isTop3 ? alpha(tone, 0.12) : theme.palette.background.paper,
  };
});

export const DriverAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  border: `2px solid ${alpha(theme.palette.grey[400], 0.4)}`,
}));

export const DriverInfo = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
}));

export const DriverName = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
  fontSize: '0.95rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const DriverRoute = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const RatingBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
  marginLeft: theme.spacing(2),
  minWidth: 64,
  justifyContent: 'flex-end',
}));

export const RankChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== '$rank',
})<{ $rank: number }>(({ theme, $rank }) => {
  const tone = getRankTone(theme, $rank);

  return {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tone,
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: '0.75rem',
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  };
});
