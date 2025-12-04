import { SettingsOutlined } from '@mui/icons-material';
import type { NavItem } from './types';

export const SIDEBAR_WIDTH = 280;
export const FLYOUT_WIDTH = 360;

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'configuration',
    label: 'Configuración',
    icon: SettingsOutlined,
    requiredModuleName: ['vehicles'],
    testId: 'nav-item-configuration',
    children: [
      {
        label: 'Vehículos',
        href: '/vehicles',
        requiredModuleName: 'vehicles',
        requiredSubject: 'vehicle',
        testId: 'nav-link-vehicles',
      },
    ],
  },
];
