import * as React from 'react';

export type NavChild = {
  label: string;
  href?: string;
  badge?: number;

  /**
   * Name(s) of the backend app_module required for this item to be visible.
   *
   * - string: the user must have that module.
   * - string[]: the user must have at least one of those modules.
   *
   * Must match EffectiveModule.appModuleName (case-insensitive).
   */
  requiredModuleName?: string | string[];

  /**
   * Optional: permission subject (e.g. "Vehicle", "Route").
   */
  requiredSubject?: string;

  /**
   * Optional: action required on the subject (e.g. "read", "update").
   * If omitted, having any action on the subject is enough.
   */
  requiredAction?: string;

  /**
   * Optional nested items (grandchildren or deeper levels).
   * These are filtered with the same module + permission rules.
   */
  children?: NavChild[];
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
   * Name(s) of the backend app_module required for this item to be visible.
   *
   * - string: the user must have that module.
   * - string[]: the user must have at least one of those modules.
   */
  requiredModuleName?: string | string[];

  /**
   * Optional: permission subject.
   */
  requiredSubject?: string;

  /**
   * Optional: specific action required on the subject.
   */
  requiredAction?: string;
};
