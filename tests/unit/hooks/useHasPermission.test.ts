import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useHasPermission } from '@/hooks/useHasPermission';

vi.mock('@/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

import { useAppSelector } from '@/store/hooks';

const useAppSelectorMock = vi.mocked(useAppSelector);

describe('useHasPermission unit behaviour', () => {
  it('returns true when selector resolves permission as allowed', () => {
    useAppSelectorMock.mockReturnValueOnce(true);

    const { result } = renderHook(() => useHasPermission('vehicle:stats'));

    expect(result.current).toBe(true);
  });

  it('returns false when selector resolves permission as denied', () => {
    useAppSelectorMock.mockReturnValueOnce(false);

    const { result } = renderHook(() => useHasPermission('vehicle:stats'));

    expect(result.current).toBe(false);
  });
});
