import { describe, it, expect } from 'vitest';

import {
  hasModuleAccess,
  hasSubjectActionAccess,
  buildNavItemsForUser,
} from '@/components/sidebar/Sidebar';
import type { EffectiveModule } from '@/types/access-control';
import type { NavItem, NavChild } from '@/components/sidebar/types';

const DummyIcon = () => null;

const effectiveModules: EffectiveModule[] = [
  {
    appModuleId: 1,
    appModuleName: 'Markets',
    appModuleDescription: null,
    appModuleActive: true,
    actionsBySubject: {
      Market: ['read', 'update'],
    },
  },
  {
    appModuleId: 2,
    appModuleName: 'Reports',
    appModuleDescription: null,
    appModuleActive: true,
    actionsBySubject: {
      BrandReport: ['read'],
    },
  },
];

describe('hasModuleAccess', () => {
  it('returns true when no requiredModuleName is provided', () => {
    const result = hasModuleAccess(effectiveModules);
    expect(result).toBe(true);
  });

  it('returns true when a matching module is present (case-insensitive)', () => {
    const result = hasModuleAccess(effectiveModules, 'markets');
    expect(result).toBe(true);
  });

  it('returns false when no matching module is present', () => {
    const result = hasModuleAccess(effectiveModules, 'Activities');
    expect(result).toBe(false);
  });
});

describe('hasSubjectActionAccess', () => {
  it('returns true when no subject is required', () => {
    const result = hasSubjectActionAccess(effectiveModules);
    expect(result).toBe(true);
  });

  it('returns true when subject is present with any action and no specific action is required', () => {
    const result = hasSubjectActionAccess(effectiveModules, 'Market');
    expect(result).toBe(true);
  });

  it('returns false when subject is not present in any module', () => {
    const result = hasSubjectActionAccess(effectiveModules, 'Invoice');
    expect(result).toBe(false);
  });

  it('returns true when subject and required action are present', () => {
    const result = hasSubjectActionAccess(
      effectiveModules,
      'Market',
      'update',
    );
    expect(result).toBe(true);
  });

  it('returns false when subject is present but required action is not allowed', () => {
    const result = hasSubjectActionAccess(effectiveModules, 'Market', 'delete');
    expect(result).toBe(false);
  });
});

describe('buildNavItemsForUser', () => {
  const navItems: NavItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: DummyIcon,
      href: '/overview',
    },
    {
      key: 'markets',
      label: 'Markets',
      icon: DummyIcon,
      requiredModuleName: 'Markets',
      children: [
        {
          label: 'Spot',
          href: '/markets/spot',
          requiredModuleName: 'Markets',
          requiredSubject: 'Market',
          requiredAction: 'read',
        } as NavChild,
        {
          label: 'Futures',
          href: '/markets/futures',
          requiredModuleName: 'Markets',
          requiredSubject: 'Market',
          requiredAction: 'delete',
        } as NavChild,
      ],
    },
    {
      key: 'activities',
      label: 'Activities',
      icon: DummyIcon,
      requiredModuleName: 'Activities',
      children: [
        {
          label: 'Tasks',
          href: '/activities/tasks',
          requiredModuleName: 'Activities',
          requiredSubject: 'Task',
          requiredAction: 'read',
        } as NavChild,
      ],
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: DummyIcon,
      requiredModuleName: 'Reports',
      children: [
        {
          label: 'Brands',
          href: '/reports/brands',
          requiredModuleName: 'Reports',
          requiredSubject: 'BrandReport',
          requiredAction: 'read',
        } as NavChild,
      ],
    },
    {
      key: 'group-no-href',
      label: 'Group without href',
      icon: DummyIcon,
      requiredModuleName: 'Markets',
      children: [
        {
          label: 'Hidden child',
          href: '/hidden',
          requiredModuleName: 'Markets',
          requiredSubject: 'Market',
          requiredAction: 'delete',
        } as NavChild,
      ],
    },
  ];

  it('keeps items without permission requirements', () => {
    const result = buildNavItemsForUser(navItems, effectiveModules);

    const keys = result.map((i) => i.key);
    expect(keys).toContain('overview');
  });

  it('keeps items whose required module is present and filters children by action', () => {
    const result = buildNavItemsForUser(navItems, effectiveModules);

    const markets = result.find((i) => i.key === 'markets');
    expect(markets).toBeDefined();
    expect(markets?.children?.length).toBe(1);
    expect(markets?.children?.[0].label).toBe('Spot');
  });

  it('removes items whose required module is not present', () => {
    const result = buildNavItemsForUser(navItems, effectiveModules);

    const keys = result.map((i) => i.key);
    expect(keys).not.toContain('activities');
  });

  it('keeps parent items with href even if all children are filtered out', () => {
    const localItems: NavItem[] = [
      {
        key: 'markets',
        label: 'Markets',
        icon: DummyIcon,
        href: '/markets',
        requiredModuleName: 'Markets',
        children: [
          {
            label: 'Hidden',
            href: '/markets/hidden',
            requiredModuleName: 'Markets',
            requiredSubject: 'Market',
            requiredAction: 'delete',
          } as NavChild,
        ],
      },
    ];

    const result = buildNavItemsForUser(localItems, effectiveModules);

    expect(result.length).toBe(1);
    expect(result[0].key).toBe('markets');
    expect(result[0].children?.length ?? 0).toBe(0);
  });

  it('removes parent items without href when all children are filtered out', () => {
    const localItems: NavItem[] = [
      {
        key: 'group-no-href',
        label: 'Group without href',
        icon: DummyIcon,
        requiredModuleName: 'Markets',
        children: [
          {
            label: 'Hidden child',
            href: '/hidden',
            requiredModuleName: 'Markets',
            requiredSubject: 'Market',
            requiredAction: 'delete',
          } as NavChild,
        ],
      },
    ];

    const result = buildNavItemsForUser(localItems, effectiveModules);

    expect(result.length).toBe(0);
  });
});
