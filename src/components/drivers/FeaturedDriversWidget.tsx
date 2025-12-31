'use client';

import React from 'react';
import { Button } from '@mui/material';

import DriverRankingItem from './DriverRankingItem';
import { MOCK_DRIVERS } from './FeaturedDriversWidget.constants';
import {
  WidgetRoot,
  WidgetHeader,
  WidgetTitle,
  DriversStack,
} from './FeaturedDriversWidget.styled';

export type FeaturedDriversWidgetProps = {
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;
};

export default function FeaturedDriversWidget({
  title = 'Conductores Destacados',
  actionLabel = 'Ver ranking',
  onActionClick,
}: FeaturedDriversWidgetProps) {
  return (
    <WidgetRoot>
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <Button
          variant="text"
          size="small"
          onClick={onActionClick}
          sx={{
            textTransform: 'none',
            fontWeight: (theme) => theme.typography.fontWeightMedium,
          }}
        >
          {actionLabel}
        </Button>
      </WidgetHeader>

      <DriversStack>
        {MOCK_DRIVERS.map((driver) => (
          <DriverRankingItem
            key={driver.rank}
            rank={driver.rank}
            name={driver.name}
            route={driver.route}
            punctuality={driver.punctuality}
            rating={driver.rating}
            avatarUrl={driver.avatarUrl}
          />
        ))}
      </DriversStack>
    </WidgetRoot>
  );
}
