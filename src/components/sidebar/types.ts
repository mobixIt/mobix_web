import * as React from 'react';

export type NavChild = {
  label: string;
  href: string;
  badge?: number;

  /**
   * Optional: name of the backend app_module required
   * for this child to be visible.
   * Should match EffectiveModule.appModuleName.
   */
  requiredModuleName?: string;

  /**
   * Optional: subject used in permissions (e.g. "Vehicle", "Route").
   */
  requiredSubject?: string;

  /**
   * Optional: specific action required on the subject
   * (e.g. "read", "update"). If omitted, any action on the subject
   * is enough.
   */
  requiredAction?: string;
};

export type NavItem = {
  key: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
  badge?: number;
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Optional: name of the backend app_module required
   * for this item to be visible.
   */
  requiredModuleName?: string;

  /**
   * Optional: subject used in permissions (e.g. "Vehicle", "Route").
   */
  requiredSubject?: string;

  /**
   * Optional: specific action required on the subject.
   */
  requiredAction?: string;
};