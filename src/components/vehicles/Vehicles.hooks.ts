import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchVehiclesCatalogs,
  selectVehiclesCatalogsData,
  selectVehiclesCatalogsError,
  selectVehiclesCatalogsStatus,
} from '@/store/slices/vehiclesCatalogsSlice';
/**
 * Hook to manage fetching and memoizing catalogs data.
 */
export function useVehiclesCatalogs(tenantSlug: string | null) {
  const dispatch = useAppDispatch();
  
  const status = useAppSelector((state) =>
    tenantSlug ? selectVehiclesCatalogsStatus(state, tenantSlug) : 'idle',
  );
  const error = useAppSelector((state) =>
    tenantSlug ? selectVehiclesCatalogsError(state, tenantSlug) : null,
  );
  const data = useAppSelector((state) =>
    tenantSlug ? selectVehiclesCatalogsData(state, tenantSlug) : null,
  );

  React.useEffect(() => {
    if (!tenantSlug) return;
    // Only fetch if idle to avoid loops or unnecessary calls if already loaded/loading
    // (Assuming the slice handles deduplication or checking state, otherwise 'idle' check is good)
    if (status === 'idle') {
       void dispatch(fetchVehiclesCatalogs({ tenantSlug }));
    }
  }, [dispatch, tenantSlug, status]);

  // Memoize raw data to stabilize dependencies
  const ownersRaw = React.useMemo(() => data?.owners ?? [], [data?.owners]);
  const driversRaw = React.useMemo(() => data?.drivers ?? [], [data?.drivers]);
  
  // Memoize simple options
  const brandOptions = React.useMemo(() => 
    data?.brands?.map(o => ({ label: o.label, value: String(o.id) })) ?? [], 
  [data?.brands]);

  const vehicleClassOptions = React.useMemo(() => 
    data?.vehicle_classes?.map(o => ({ label: o.label, value: String(o.id) })) ?? [], 
  [data?.vehicle_classes]);

  const bodyTypeOptions = React.useMemo(() => 
    data?.body_types?.map(o => ({ label: o.label, value: String(o.id) })) ?? [], 
  [data?.body_types]);

  return {
    status,
    error,
    hasCatalogs: data != null,
    ownersRaw,
    driversRaw,
    brandOptions,
    vehicleClassOptions,
    bodyTypeOptions,
    retry: () => tenantSlug && dispatch(fetchVehiclesCatalogs({ tenantSlug, force: true })),
  };
}
