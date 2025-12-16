import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import permissionsReducer, { type PermissionsState } from '@/store/slices/permissionsSlice';
import type { MembershipResponse } from '@/types/access-control';
import { useHasPermission } from '@/hooks/useHasPermission';

type WrapperProps = { children: React.ReactNode };

type TestRootState = {
  permissions: PermissionsState;
};

const buildMembershipResponse = (
  overrides: Partial<MembershipResponse> = {},
): MembershipResponse => ({
  id: 1,
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  phone: null,
  memberships: [],
  ...overrides,
});

export function buildWrapper(preloadedPermissionsState: PermissionsState) {
  const store = configureStore<TestRootState>({
    reducer: { permissions: permissionsReducer },
    preloadedState: { permissions: preloadedPermissionsState },
  });

  return function Wrapper({ children }: WrapperProps) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useHasPermission integration with real selector', () => {
  it('returns false while permissions are loading', () => {
    const wrapper = buildWrapper({
      loading: true,
      membership: null,
      error: null,
      effectiveModules: [],
      flatPermissions: ['vehicle:stats'],
    });

    const { result } = renderHook(() => useHasPermission('vehicle:stats'), { wrapper });

    expect(result.current).toBe(false);
  });

  it('returns false when permissions are ready but permission is missing', () => {
    const wrapper = buildWrapper({
      loading: false,
      membership: buildMembershipResponse(),
      error: null,
      effectiveModules: [],
      flatPermissions: ['vehicle:read'],
    });

    const { result } = renderHook(() => useHasPermission('vehicle:stats'), { wrapper });

    expect(result.current).toBe(false);
  });

  it('returns true when permissions are ready and permission exists', () => {
    const wrapper = buildWrapper({
      loading: false,
      membership: buildMembershipResponse(),
      error: null,
      effectiveModules: [],
      flatPermissions: ['vehicle:stats'],
    });

    const { result } = renderHook(() => useHasPermission('vehicle:stats'), { wrapper });

    expect(result.current).toBe(true);
  });
});
