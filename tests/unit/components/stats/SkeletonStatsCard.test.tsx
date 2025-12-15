import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

type StatsCardVariant = 'teal' | 'green' | 'yellow' | 'navy';

type CardRootProps = {
  $variant: StatsCardVariant;
  $active: boolean;
  children: React.ReactNode;
  'data-testid'?: string;
};

type IconWrapperProps = {
  $variant: StatsCardVariant;
  $active: boolean;
  children?: React.ReactNode;
};

type ShimmerSkeletonProps = {
  variant: 'rounded' | 'circular';
  width: number;
  height: number;
};

type RecordedCall =
  | { component: 'CardRoot'; props: CardRootProps }
  | { component: 'IconWrapper'; props: IconWrapperProps }
  | { component: 'ShimmerSkeleton'; props: ShimmerSkeletonProps };

const recordedCalls: RecordedCall[] = [];

vi.mock(
  '@/components/stats/StatsCardsSkeleton/StatsCardsSkeleton.styled',
  async () => {
    const CardRoot: React.FC<CardRootProps> = (props) => {
      recordedCalls.push({ component: 'CardRoot', props });
      return (
        <div data-testid={props['data-testid']} data-variant={props.$variant} data-active={String(props.$active)}>
          {props.children}
        </div>
      );
    };

    const Main: React.FC<{ children: React.ReactNode }> = ({ children }) => <section>{children}</section>;
    const HelperRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;

    const IconWrapper: React.FC<IconWrapperProps> = (props) => {
      recordedCalls.push({ component: 'IconWrapper', props });
      return (
        <aside data-variant={props.$variant} data-active={String(props.$active)}>
          {props.children}
        </aside>
      );
    };

    const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = (props) => {
      recordedCalls.push({ component: 'ShimmerSkeleton', props });
      return (
        <span
          data-skeleton-variant={props.variant}
          data-skeleton-width={String(props.width)}
          data-skeleton-height={String(props.height)}
        />
      );
    };

    return { CardRoot, Main, HelperRow, IconWrapper, ShimmerSkeleton };
  },
);

import StatsCardSkeleton from '@/components/stats/StatsCardsSkeleton/StatsCardsSkeleton';

const findLastCardRootCall = (): CardRootProps => {
  const last = [...recordedCalls].reverse().find((c) => c.component === 'CardRoot');
  if (!last || last.component !== 'CardRoot') throw new Error('CardRoot was not recorded');
  return last.props;
};

const findLastIconWrapperCall = (): IconWrapperProps => {
  const last = [...recordedCalls].reverse().find((c) => c.component === 'IconWrapper');
  if (!last || last.component !== 'IconWrapper') throw new Error('IconWrapper was not recorded');
  return last.props;
};

const findAllShimmerSkeletonCalls = (): ShimmerSkeletonProps[] => {
  return recordedCalls.flatMap((c) => (c.component === 'ShimmerSkeleton' ? [c.props] : []));
};

describe('StatsCardSkeleton unit contract', () => {
  beforeEach(() => {
    recordedCalls.length = 0;
  });

  it('renders a CardRoot that receives the provided variant and defaults isActive to false when omitted', () => {
    render(<StatsCardSkeleton variant={'teal' satisfies StatsCardVariant} />);

    const cardRootProps = findLastCardRootCall();

    expect(cardRootProps.$variant).toBe('teal');
    expect(cardRootProps.$active).toBe(false);
  });

  it('renders a CardRoot that receives the provided data-testid for stable automation hooks', () => {
    render(<StatsCardSkeleton variant={'green' satisfies StatsCardVariant} data-testid="stats-card-skeleton-1" />);

    expect(screen.getByTestId('stats-card-skeleton-1')).toBeInTheDocument();

    const cardRootProps = findLastCardRootCall();
    expect(cardRootProps['data-testid']).toBe('stats-card-skeleton-1');
  });

  it('propagates variant and isActive consistently to IconWrapper for visual parity with the real StatsCard', () => {
    render(<StatsCardSkeleton variant={'yellow' satisfies StatsCardVariant} isActive />);

    const cardRootProps = findLastCardRootCall();
    const iconWrapperProps = findLastIconWrapperCall();

    expect(cardRootProps.$variant).toBe('yellow');
    expect(cardRootProps.$active).toBe(true);

    expect(iconWrapperProps.$variant).toBe('yellow');
    expect(iconWrapperProps.$active).toBe(true);
  });

  it('renders exactly four shimmer skeleton blocks with the expected layout contract', () => {
    render(<StatsCardSkeleton variant={'navy' satisfies StatsCardVariant} />);

    const shimmerCalls = findAllShimmerSkeletonCalls();

    expect(shimmerCalls).toHaveLength(4);

    expect(shimmerCalls[0]).toEqual({ variant: 'rounded', width: 80, height: 14 });
    expect(shimmerCalls[1]).toEqual({ variant: 'rounded', width: 96, height: 44 });
    expect(shimmerCalls[2]).toEqual({ variant: 'circular', width: 14, height: 14 });
    expect(shimmerCalls[3]).toEqual({ variant: 'rounded', width: 160, height: 14 });
  });
});
