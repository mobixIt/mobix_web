import * as React from 'react';
import { Suspense } from 'react';
import { StrategyOrchestrator } from '@/components/strategy/StrategyOrchestrator';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import { resolveModuleStrategy } from '@/lib/strategy/resolveModuleStrategy';

export const metadata = {
  title: 'Vehículos | Mobix',
};

export default async function VehiclesPage() {
  const strategy = await resolveModuleStrategy('vehicles');

  return (
    <Suspense fallback={<IndexPageSkeleton showStats={false} showFilters={false} />}>
      <StrategyOrchestrator
        module="vehicles"
        strategy={strategy}
      />
    </Suspense>
  );
}
