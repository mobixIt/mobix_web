import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

const pushSpy = vi.fn();
const prefetchSpy = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushSpy,
    prefetch: prefetchSpy,
  }),
}));

import { SidebarLink } from '@/components/sidebar/SidebarLink';

describe('SidebarLink', () => {
beforeEach(() => {
  pushSpy.mockReset();
  prefetchSpy.mockReset();

  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...window.location,
    assign: vi.fn(),
    replace: vi.fn(),
  } as unknown as Location);

  (window as unknown as { navigation: unknown }).navigation = {
    navigate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

  it('calls router.push on primary click', () => {
    const { getByText } = render(<SidebarLink href="/vehicles">Vehicles</SidebarLink>);

    fireEvent.click(getByText('Vehicles'), { button: 0 });

    expect(pushSpy).toHaveBeenCalledWith('/vehicles', { scroll: true });
  });

  it('does not intercept modified clicks', () => {
    const { getByText } = render(<SidebarLink href="/vehicles">Vehicles</SidebarLink>);
    const anchor = getByText('Vehicles').closest('a');
    anchor?.addEventListener('click', (e) => e.preventDefault());

    fireEvent.click(getByText('Vehicles'), { metaKey: true, button: 0 });

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('prefetches intentionally on pointer enter', () => {
    const { getByText } = render(<SidebarLink href="/vehicles">Vehicles</SidebarLink>);

    fireEvent.pointerEnter(getByText('Vehicles'));

    expect(prefetchSpy).toHaveBeenCalledWith('/vehicles');
  });
});
