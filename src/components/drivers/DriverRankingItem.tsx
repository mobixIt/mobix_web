'use client';

import React from 'react';
import StarIcon from '@mui/icons-material/Star';

import { getUserAvatarUrl } from '@/services/avatarService';
import {
  DriverCard,
  DriverAvatar,
  DriverInfo,
  DriverName,
  DriverRoute,
  RatingBadge,
  RankChip,
} from './DriverRankingItem.styled';
import type { DriverRankingItemProps } from './DriverRankingItem.types';

export type { DriverRankingItemProps } from './DriverRankingItem.types';

export default function DriverRankingItem({
  rank,
  name,
  route,
  punctuality,
  rating,
  avatarUrl,
  'data-testid': dataTestId,
}: DriverRankingItemProps) {
  const resolvedAvatar = avatarUrl || getUserAvatarUrl(name);
  const showBadge = rank >= 1 && rank <= 3;

  return (
    <DriverCard $rank={rank} data-testid={dataTestId}>
      <div style={{ position: 'relative' }}>
        <DriverAvatar src={resolvedAvatar} alt={name} />
        {showBadge && (
          <RankChip
            $rank={rank}
            label={rank}
            size="small"
            sx={{ position: 'absolute', top: -6, right: -6 }}
          />
        )}
      </div>

      <DriverInfo>
        <DriverName>{name}</DriverName>
        <DriverRoute variant="body2">
          {route} • {punctuality} puntualidad
        </DriverRoute>
      </DriverInfo>

      <RatingBadge aria-label="driver-rating">
        <StarIcon fontSize="small" htmlColor="#F59E0B" />
        <span>{rating}</span>
      </RatingBadge>
    </DriverCard>
  );
}
