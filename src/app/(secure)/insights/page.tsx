import { Suspense } from 'react';
import { StrategyOrchestrator } from '@/components/strategy/StrategyOrchestrator';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import { resolveModuleStrategy } from '@/lib/strategy/resolveModuleStrategy';

export const metadata = {
  title: 'Insights | Mobix',
};

async function getTenantConfig() {
  return {}; 
}

export default async function InsightsPage() {
  const tenantSettings = await getTenantConfig();

  const strategyName = await resolveModuleStrategy(
    'trips-report', 
    'index', 
    { preferred: tenantSettings.trips_view_mode }
  );

  return (
    <Suspense fallback={<IndexPageSkeleton showStats={false} showFilters={false} />}>
      <StrategyOrchestrator
        module="trips-report"
        action="index"
        strategy={strategyName}
        title="Insights"
      />
    </Suspense>
  );
}
