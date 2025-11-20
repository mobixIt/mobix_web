import {
  HomeOutlined,
  LayersOutlined,
  Inventory2Outlined,
  AssessmentOutlined,
  TrendingUpOutlined,
  PieChartOutline,
  SettingsOutlined,
  HeadphonesOutlined,
} from '@mui/icons-material';
import type { NavItem } from './types';

export const SIDEBAR_WIDTH = 280;
export const FLYOUT_WIDTH = 360;

export const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: HomeOutlined, href: '/overview' },

  {
    key: 'markets',
    label: 'Markets',
    icon: LayersOutlined,
    requiredModuleName: 'Markets',
    children: [
      {
        label: 'Spot',
        href: '/markets/spot',
        requiredModuleName: 'Markets',
        requiredSubject: 'Market',
        requiredAction: 'read',
      },
      {
        label: 'Futures',
        href: '/markets/futures',
        requiredModuleName: 'Markets',
        requiredSubject: 'Market',
        requiredAction: 'read',
      },
    ],
  },
  {
    key: 'activities',
    label: 'Activities',
    icon: Inventory2Outlined,
    badge: 9,
    requiredModuleName: 'Activities',
    children: [
      {
        label: 'Tasks',
        href: '/activities/tasks',
        requiredModuleName: 'Activities',
        requiredSubject: 'Task',
        requiredAction: 'read',
      },
      {
        label: 'Approvals',
        href: '/activities/approvals',
        requiredModuleName: 'Activities',
        requiredSubject: 'Approval',
        requiredAction: 'read',
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: AssessmentOutlined,
    badge: 7,
    requiredModuleName: 'Reports',
    children: [
      {
        label: 'Brands',
        href: '/reports/brands',
        requiredModuleName: 'Reports',
        requiredSubject: 'BrandReport',
        requiredAction: 'read',
      },
      {
        label: 'Customers',
        href: '/reports/customers',
        requiredModuleName: 'Reports',
        requiredSubject: 'CustomerReport',
        requiredAction: 'read',
      },
    ],
  },
  {
    key: 'performance',
    label: 'Performance',
    icon: TrendingUpOutlined,
    requiredModuleName: 'Performance',
    children: [
      {
        label: 'KPIs',
        href: '/performance/kpis',
        requiredModuleName: 'Performance',
        requiredSubject: 'Kpi',
        requiredAction: 'read',
      },
    ],
  },
  {
    key: 'income',
    label: 'Income',
    icon: PieChartOutline,
    requiredModuleName: 'Income',
    children: [
      {
        label: 'Invoices',
        href: '/income/invoices',
        requiredModuleName: 'Income',
        requiredSubject: 'Invoice',
        requiredAction: 'read',
      },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingsOutlined,
    href: '/settings',
    requiredModuleName: 'Settings',
  },
  // Help sin restricción de permisos (por ejemplo docs o soporte)
  { key: 'help', label: 'Help', icon: HeadphonesOutlined, href: '/help' },
];