'use client';

import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import MetricCard from './MetricCard';
import { MOCK_METRICS } from './QuickMetricsWidget.constants';
import {
  WidgetRoot,
  WidgetHeader,
  WidgetTitle,
  WidgetTimestamp,
  MetricsGrid,
} from './QuickMetricsWidget.styled';

export type QuickMetricsWidgetProps = {
  title?: string;
  updatedText?: string;
};

export default function QuickMetricsWidget({
  title = 'Métricas Rápidas',
  updatedText = 'Actualizado hace 5 min',
}: QuickMetricsWidgetProps) {
  return (
    <WidgetRoot>
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <WidgetTimestamp>
          <AccessTimeIcon fontSize="small" />
          <span>{updatedText}</span>
        </WidgetTimestamp>
      </WidgetHeader>

      <MetricsGrid>
        {MOCK_METRICS.map((metric) => (
          // eslint-disable-next-line @typescript-eslint/naming-convention
          // keep PascalCase for component instantiation
          <MetricCard
            key={metric.id}
            value={metric.value}
            label={metric.label}
            variant={metric.variant}
            icon={<metric.icon />}
            data-testid={metric.id}
          />
        ))}
      </MetricsGrid>
    </WidgetRoot>
  );
}
