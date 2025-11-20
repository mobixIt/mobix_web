import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { EffectiveModule } from '@/types/access-control';
import { selectEffectiveModules } from '@/store/slices/permissionsSlice';
import { selectCurrentPerson } from '@/store/slices/authSlice';

const mockUseSelector = vi.fn();
const mockUseDispatch = vi.fn();

type SelectorFn = (state: unknown) => unknown;

vi.mock('react-redux', () => ({
  useSelector: (selector: SelectorFn) => mockUseSelector(selector),
  useDispatch: () => mockUseDispatch,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('@/components/sidebar/constants', () => ({
  SIDEBAR_WIDTH: 280,
  FLYOUT_WIDTH: 360,
  NAV_ITEMS: [
    {
      key: 'overview',
      label: 'Overview',
      icon: () => null,
      href: '/overview',
    },
    {
      key: 'markets',
      label: 'Markets',
      icon: () => null,
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
      key: 'reports',
      label: 'Reports',
      icon: () => null,
      requiredModuleName: 'Reports',
      children: [
        {
          label: 'Brands',
          href: '/reports/brands',
          requiredModuleName: 'Reports',
          requiredSubject: 'BrandReport',
          requiredAction: 'read',
        },
      ],
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: () => null,
      href: '/settings',
      requiredModuleName: 'Settings',
    },
    {
      key: 'help',
      label: 'Help',
      icon: () => null,
      href: '/help',
    },
  ],
}));

import Sidebar from '@/components/sidebar/Sidebar';

const modulesWithMarketsAndReports: EffectiveModule[] = [
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

const emptyModules: EffectiveModule[] = [];

const personFixture = {
  id: 1,
  first_name: 'Harold',
  last_name: 'Rangel',
  email: 'user@example.com',
};

function mockSelectors({
  modules,
  person,
}: {
  modules: EffectiveModule[];
  person: typeof personFixture | null;
}) {
  mockUseSelector.mockImplementation((selector: SelectorFn) => {
    if (selector === selectEffectiveModules) return modules;
    if (selector === selectCurrentPerson) return person;
    return undefined;
  });
}

beforeEach(() => {
  mockUseSelector.mockReset();
  mockUseDispatch.mockReset();
});

describe('Sidebar integration', () => {
  it('renders only nav items allowed by effective modules', () => {
    mockSelectors({
      modules: modulesWithMarketsAndReports,
      person: personFixture,
    });

    render(<Sidebar />);

    expect(screen.getByText('Overview')).toBeVisible();
    expect(screen.getByText('Help')).toBeVisible();

    expect(screen.getByText('Markets')).toBeVisible();
    expect(screen.getByText('Reports')).toBeVisible();

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('when there are no effective modules, only items without requirements are shown', () => {
    mockSelectors({
      modules: emptyModules,
      person: personFixture,
    });

    render(<Sidebar />);

    expect(screen.getByText('Overview')).toBeVisible();
    expect(screen.getByText('Help')).toBeVisible();

    expect(screen.queryByText('Markets')).not.toBeInTheDocument();
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('shows current person name and email in the UserCard when available', () => {
    mockSelectors({
      modules: modulesWithMarketsAndReports,
      person: personFixture,
    });

    render(<Sidebar />);

    expect(
      screen.getByText(`${personFixture.first_name} ${personFixture.last_name}`),
    ).toBeVisible();
    expect(screen.getByText(personFixture.email)).toBeVisible();
  });

  it('falls back to generic label when there is no current person', () => {
    mockSelectors({
      modules: modulesWithMarketsAndReports,
      person: null,
    });

    render(<Sidebar />);

    expect(screen.getByText('Usuario')).toBeVisible();
  });
});
