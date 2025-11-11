import { SvgIconComponent } from '@mui/icons-material';

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

export type NavKey =
  | 'overview' | 'markets' | 'activities' | 'reports'
  | 'performance' | 'income' | 'settings' | 'help';

export type NavItem = {
  key: NavKey;
  label: string;
  icon: SvgIconComponent;    // componente, no elemento
  href?: string;             // opcional si no navega
  badge?: number;
  children?: Array<{ label: string; href: string }>; // flyout
};

export const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: HomeOutlined, href: '/overview' },
  {
    key: 'markets', label: 'Markets', icon: LayersOutlined, children: [
      { label: 'Spot', href: '/markets/spot' },
      { label: 'Futures', href: '/markets/futures' },
    ]
  },
  {
    key: 'activities', label: 'Activities', icon: Inventory2Outlined, badge: 9, children: [
      { label: 'Tasks', href: '/activities/tasks' },
      { label: 'Approvals', href: '/activities/approvals' },
    ]
  },
  {
    key: 'reports', label: 'Reports', icon: AssessmentOutlined, badge: 7, children: [
      { label: 'Brands', href: '/reports/brands' },
      { label: 'Customers', href: '/reports/customers' },
    ]
  },
  {
    key: 'performance', label: 'Performance', icon: TrendingUpOutlined, children: [
      { label: 'KPIs', href: '/performance/kpis' },
    ]
  },
  {
    key: 'income', label: 'Income', icon: PieChartOutline, children: [
      { label: 'Invoices', href: '/income/invoices' },
    ]
  },
  { key: 'settings', label: 'Settings', icon: SettingsOutlined, href: '/settings' },
  { key: 'help', label: 'Help', icon: HeadphonesOutlined, href: '/help' },
];