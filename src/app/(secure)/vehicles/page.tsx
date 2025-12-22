import * as React from 'react';
import { Suspense } from 'react';
import Vehicles from '@/components/vehicles';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';

export const metadata = {
  title: 'Vehículos | Mobix',
};

export default function VehiclesPage() {
  return (
    <Suspense fallback={<IndexPageSkeleton showStats={false} showFilters={false} />}>
      <Vehicles />
    </Suspense>
  );
}
