import { SvgIconComponent } from '@mui/icons-material';

export type NavKey =
  | 'overview'
  | 'markets'
  | 'activities'
  | 'reports'
  | 'performance'
  | 'income'
  | 'settings'
  | 'help';

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  key: NavKey;
  label: string;
  icon: SvgIconComponent;  // Componente de icono MUI
  href?: string;           // Ruta directa si no es un menú con hijos
  badge?: number;          // Badge opcional
  children?: NavChild[];   // Submenú (flyout)
  action?: {
    label: string;         // Texto del tooltip
    onClick: () => void;   // Acción al presionar botón contextual
  };
}