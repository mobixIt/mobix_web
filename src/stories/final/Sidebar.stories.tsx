'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  SettingsOutlined,
  DirectionsBusFilledOutlined,
  AnalyticsOutlined,
  MapOutlined,
  RouteOutlined,
  PeopleAltOutlined,
} from '@mui/icons-material';

import SidebarView, {
  type SidebarViewProps,
} from '@/components/sidebar/SidebarView';

import type { NavItem } from '@/components/sidebar/types';
import type { TenantOption } from '@/components/header/TenantSwitcher';

/* ===============================
   NAV ITEMS (BASIC)
================================= */
const navItemsBasic: NavItem[] = [
  {
    key: 'configuration',
    label: 'Configuración',
    icon: SettingsOutlined,
    requiredModuleName: ['vehicles'],
    children: [
      {
        label: 'Vehículos',
        href: '/vehicles',
        requiredModuleName: 'vehicles',
        requiredSubject: 'vehicle',
        icon: DirectionsBusFilledOutlined,
      },
    ],
  },
];

/* ===============================
   NAV ITEMS (MULTIPLE SECTIONS)
================================= */
const navItemsMultiple: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Tablero',
    icon: AnalyticsOutlined,
    requiredModuleName: ['dashboard'],
    children: [
      {
        label: 'Resumen general',
        href: '/dashboard',
        requiredModuleName: 'dashboard',
        requiredSubject: 'dashboard',
        icon: AnalyticsOutlined,
      },
    ],
  },
  {
    key: 'operations',
    label: 'Operación',
    icon: DirectionsBusFilledOutlined,
    requiredModuleName: ['operations'],
    children: [
      {
        label: 'Rutas',
        href: '/operations/routes',
        requiredModuleName: 'operations',
        requiredSubject: 'route',
        icon: RouteOutlined,
      },
      {
        label: 'Despachos',
        href: '/operations/dispatches',
        requiredModuleName: 'operations',
        requiredSubject: 'dispatch',
        icon: DirectionsBusFilledOutlined,
      },
    ],
  },
  {
    key: 'configuration',
    label: 'Configuración',
    icon: SettingsOutlined,
    requiredModuleName: ['vehicles'],
    children: [
      {
        label: 'Vehículos',
        href: '/vehicles',
        requiredModuleName: 'vehicles',
        requiredSubject: 'vehicle',
        icon: DirectionsBusFilledOutlined,
      },
      {
        label: 'Conductores',
        href: '/drivers',
        requiredModuleName: 'drivers',
        requiredSubject: 'driver',
        icon: PeopleAltOutlined,
      },
    ],
  },
];

/* ===============================
   NAV ITEMS (WITH GRANDCHILDREN)
================================= */
const navItemsWithGrandchildren: NavItem[] = [
  {
    key: 'operations',
    label: 'Operación',
    icon: DirectionsBusFilledOutlined,
    requiredModuleName: ['operations'],
    children: [
      {
        label: 'Monitoreo en vivo',
        href: '/operations/live',
        requiredModuleName: 'operations',
        requiredSubject: 'realtime',
        icon: DirectionsBusFilledOutlined,
      },
      {
        label: 'Control de rutas',
        requiredModuleName: 'operations',
        requiredSubject: 'route',
        icon: RouteOutlined,
        children: [
          {
            label: 'Mapa general',
            href: '/operations/routes/map',
            requiredModuleName: 'operations',
            requiredSubject: 'route',
          },
          {
            label: 'Itinerarios',
            href: '/operations/routes/itineraries',
            requiredModuleName: 'operations',
            requiredSubject: 'route',
          },
        ],
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reportes',
    icon: AnalyticsOutlined,
    requiredModuleName: ['reports'],
    children: [
      {
        label: 'Indicadores',
        requiredModuleName: 'reports',
        requiredSubject: 'reports',
        icon: AnalyticsOutlined,
        children: [
          {
            label: 'Ocupación por ruta',
            href: '/reports/occupancy/by-route',
            requiredModuleName: 'reports',
            requiredSubject: 'reports',
          },
          {
            label: 'Puntualidad',
            href: '/reports/punctuality',
            requiredModuleName: 'reports',
            requiredSubject: 'reports',
          },
        ],
      },
      {
        label: 'Mapa de calor',
        href: '/reports/heatmap',
        requiredModuleName: 'reports',
        requiredSubject: 'reports',
        icon: MapOutlined,
      },
    ],
  },
  {
    key: 'configuration',
    label: 'Configuración',
    icon: SettingsOutlined,
    requiredModuleName: ['system'],
    children: [
      {
        label: 'Tenants',
        href: '/configuration/tenants',
        requiredModuleName: 'system',
        requiredSubject: 'tenant',
        icon: PeopleAltOutlined,
      },
    ],
  },
];

/* ===============================
   TENANTS
================================= */
const tenantOptions: TenantOption[] = [
  {
    id: '1',
    name: 'Coolitoral',
    slug: 'coolitoral',
    logoUrl: 'https://i.ibb.co/PsK7j53G/logo-fake-coolitoral.png',
  },
  {
    id: '2',
    name: 'Sobusa',
    slug: 'sobusa',
    logoUrl: 'https://i.ibb.co/mrN1v0VQ/logo-fake-sobusa.png',
  },
];

/* ===============================
   META — SIN THEME PROVIDER AQUI
================================= */
const meta: Meta<typeof SidebarView> = {
  title: 'Mobix/Final/Sidebar',
  component: SidebarView,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof SidebarView>;

/* ===============================
   STORIES
================================= */

export const Default: Story = {
  args: {
    navItems: navItemsBasic,
    pathname: '/vehicles',
    tenantOptions,
    currentTenant: tenantOptions[0],
    onTenantChange: (tenant: TenantOption) => console.log('change tenant', tenant),
  } satisfies SidebarViewProps,
};

export const MultipleSections: Story = {
  args: {
    navItems: navItemsMultiple,
    pathname: '/operations/routes',
    tenantOptions,
    currentTenant: tenantOptions[1],
    onTenantChange: (tenant: TenantOption) => console.log('change tenant', tenant),
  } satisfies SidebarViewProps,
};

export const WithGrandchildren: Story = {
  args: {
    navItems: navItemsWithGrandchildren,
    pathname: '/operations/routes/itineraries',
    tenantOptions,
    currentTenant: tenantOptions[0],
    onTenantChange: (tenant: TenantOption) => console.log('change tenant', tenant),
  } satisfies SidebarViewProps,
};

export const NoTenants: Story = {
  args: {
    navItems: navItemsWithGrandchildren,
    pathname: '/reports/heatmap',
    tenantOptions: [],
    currentTenant: null,
    onTenantChange: () => {},
  } satisfies SidebarViewProps,
};
