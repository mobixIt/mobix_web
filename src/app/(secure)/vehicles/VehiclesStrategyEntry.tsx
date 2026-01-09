'use client';

import * as React from 'react';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import { StrategyOrchestrator } from '@/components/strategy/StrategyOrchestrator';
import { useResolvedModuleStrategy } from '@/hooks/useResolvedModuleStrategy';

export default function VehiclesStrategyEntry() {
  const resolved = useResolvedModuleStrategy('vehicles', 'index');

  if (resolved.status === 'loading') {
    return <IndexPageSkeleton showStats={false} showFilters={false} />;
  }

  if (resolved.status === 'inactive') {
    return null;
  }

  if (resolved.status === 'error') {
    throw new Error(resolved.error);
  }

  return (
    <StrategyOrchestrator
      module="vehicles"
      action="index"
      strategy={resolved.strategy}
      title="Flota de Vehículos"
    />
  );
}
