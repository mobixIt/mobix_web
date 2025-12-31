'use client';

import type React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DescriptionIcon from '@mui/icons-material/Description';

import type { ActivityVariant } from './ActivityItem.types';

export type ActivityEntry = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  variant: ActivityVariant;
  icon: React.ElementType;
};

export const MOCK_ACTIVITIES: ActivityEntry[] = [
  {
    id: 'activity-1',
    title: 'Mantenimiento completado',
    description: 'Bus #A-245',
    timestamp: 'Hace 15 min',
    variant: 'success',
    icon: CheckIcon,
  },
  {
    id: 'activity-2',
    title: 'Nueva ruta activada',
    description: 'Ruta Expreso Norte',
    timestamp: 'Hace 1 hora',
    variant: 'info',
    icon: AltRouteIcon,
  },
  {
    id: 'activity-3',
    title: 'Alerta de retraso',
    description: 'Ruta Sur',
    timestamp: 'Hace 2 horas',
    variant: 'warning',
    icon: ErrorOutlineIcon,
  },
  {
    id: 'activity-4',
    title: 'Nuevo conductor registrado',
    description: 'Miguel Torres',
    timestamp: 'Hace 3 horas',
    variant: 'user',
    icon: PersonAddAlt1Icon,
  },
  {
    id: 'activity-5',
    title: 'Reporte generado',
    description: 'Análisis de Yield',
    timestamp: 'Hace 4 horas',
    variant: 'report',
    icon: DescriptionIcon,
  },
];
