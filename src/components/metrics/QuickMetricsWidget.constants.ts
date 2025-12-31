'use client';

import type React from 'react';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import StarIcon from '@mui/icons-material/Star';

import type { MetricVariant } from './MetricCard.types';

export type QuickMetricItem = {
  id: string;
  value: string;
  label: string;
  variant: MetricVariant;
  icon: React.ElementType;
};

export const MOCK_METRICS: QuickMetricItem[] = [
  {
    id: 'metric-1',
    value: '12.4K',
    label: 'Pasajeros Hoy',
    variant: 'passengers',
    icon: PeopleAltIcon,
  },
  {
    id: 'metric-2',
    value: '48',
    label: 'Rutas Activas',
    variant: 'routes',
    icon: AltRouteIcon,
  },
  {
    id: 'metric-3',
    value: '94%',
    label: 'Puntualidad',
    variant: 'punctuality',
    icon: AccessTimeIcon,
  },
  {
    id: 'metric-4',
    value: '8.2L',
    label: 'Consumo/100km',
    variant: 'fuel',
    icon: LocalGasStationIcon,
  },
  {
    id: 'metric-5',
    value: '4.7',
    label: 'Satisfacción',
    variant: 'satisfaction',
    icon: StarIcon,
  },
];
