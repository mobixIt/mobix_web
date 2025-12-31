'use client';

export type DriverRankingItemProps = {
  rank: number;
  name: string;
  route: string;
  punctuality: string;
  rating: string;
  avatarUrl?: string;
  'data-testid'?: string;
};
