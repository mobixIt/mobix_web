'use client';

import React from 'react';
import { Button } from '@mui/material';

import ActivityItem from './ActivityItem';
import { MOCK_ACTIVITIES } from './RecentActivityWidget.constants';
import {
  WidgetRoot,
  WidgetHeader,
  WidgetTitle,
  ItemsStack,
  ItemDivider,
} from './RecentActivityWidget.styled';

export type RecentActivityWidgetProps = {
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;
};

export default function RecentActivityWidget({
  title = 'Actividad Reciente',
  actionLabel = 'Ver todas',
  onActionClick,
}: RecentActivityWidgetProps) {
  return (
    <WidgetRoot>
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <Button
          variant="text"
          size="small"
          onClick={onActionClick}
          sx={{ textTransform: 'none', fontWeight: (theme) => theme.typography.fontWeightMedium }}
        >
          {actionLabel}
        </Button>
      </WidgetHeader>

      <ItemsStack>
        {MOCK_ACTIVITIES.map((activity, index) => {
          const IconComponent = activity.icon;
          const isLast = index === MOCK_ACTIVITIES.length - 1;

          return (
            <React.Fragment key={activity.id}>
              <ActivityItem
                title={activity.title}
                description={activity.description}
                timestamp={activity.timestamp}
                variant={activity.variant}
                icon={<IconComponent />}
                data-testid={activity.id}
              />
              {!isLast && <ItemDivider />}
            </React.Fragment>
          );
        })}
      </ItemsStack>
    </WidgetRoot>
  );
}
