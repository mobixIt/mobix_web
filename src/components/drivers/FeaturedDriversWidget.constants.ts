'use client';

import type { DriverRankingItemProps } from './DriverRankingItem.types';

export type DriverEntry = DriverRankingItemProps;

export const MOCK_DRIVERS: DriverEntry[] = [
  {
    rank: 1,
    name: 'Juan Pérez',
    route: 'Ruta Norte',
    punctuality: '98%',
    rating: '4.9',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  },
  {
    rank: 2,
    name: 'María González',
    route: 'Ruta Centro',
    punctuality: '96%',
    rating: '4.8',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
  },
  {
    rank: 3,
    name: 'Carlos Ramírez',
    route: 'Ruta Este',
    punctuality: '95%',
    rating: '4.7',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
  },
  {
    rank: 4,
    name: 'Luis Fernández',
    route: 'Ruta Sur',
    punctuality: '94%',
    rating: '4.6',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
  },
  {
    rank: 5,
    name: 'Roberto Sánchez',
    route: 'Ruta Oeste',
    punctuality: '93%',
    rating: '4.5',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
  },
];
