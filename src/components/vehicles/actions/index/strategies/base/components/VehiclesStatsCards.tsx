'use client';

import * as React from 'react';

import { Alert, Button } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

import StatsCardsSection from '@/components/layout/stats-cards/StatsCardsSection';
import StatsCard from '@/components/stats/StatsCard';
import StatsCardSkeleton from '@/components/stats/StatsCardsSkeleton/StatsCardsSkeleton';

import { formatPercent } from '@/utils/formatters/percent';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectActionsForSubject, selectModuleByKey } from '@/store/slices/permissionsSlice';
import {
  fetchVehiclesStats,
  selectVehiclesStatsData,
  selectVehiclesStatsError,
  selectVehiclesStatsStatus,
} from '@/store/slices/vehiclesStatsSlice';

type VehiclesStatsCardsProps = {
  tenantSlug: string | null;
};

type DeltaUi = {
  helperText: string;
  helperIcon: React.ReactNode;
};

const buildDeltaUi = (delta: number): DeltaUi => {
  if (delta > 0) {
    return {
      helperText: `+${delta} vs mes anterior`,
      helperIcon: <ArrowUpwardIcon fontSize="inherit" />,
    };
  }

  if (delta < 0) {
    return {
      helperText: `${delta} vs mes anterior`,
      helperIcon: <ArrowDownwardIcon fontSize="inherit" />,
    };
  }

  return {
    helperText: 'Sin variación',
    helperIcon: <TrendingFlatIcon fontSize="inherit" />,
  };
};

const VehiclesStatsCards: React.FC<VehiclesStatsCardsProps> = ({ tenantSlug }) => {
  const dispatch = useAppDispatch();

  const vehiclesModule = useAppSelector(selectModuleByKey('Vehicles'));
  const vehicleActions = useAppSelector(selectActionsForSubject('vehicle'));

  const canSeeVehicleStats =
    Boolean(tenantSlug) &&
    Boolean(vehiclesModule) &&
    vehicleActions.includes('stats');

  const vehiclesStatsStatus = useAppSelector((state) =>
    tenantSlug ? selectVehiclesStatsStatus(state, tenantSlug) : 'idle',
  );

  const vehiclesStatsData = useAppSelector((state) =>
    tenantSlug ? selectVehiclesStatsData(state, tenantSlug) : null,
  );

  const vehiclesStatsError = useAppSelector((state) =>
    tenantSlug ? selectVehiclesStatsError(state, tenantSlug) : null,
  );

  const statsErrorStatus = vehiclesStatsError?.status ?? null;

  React.useEffect(() => {
    if (!tenantSlug) return;
    if (!canSeeVehicleStats) return;

    void dispatch(fetchVehiclesStats({ tenantSlug }));
  }, [dispatch, tenantSlug, canSeeVehicleStats]);

  React.useEffect(() => {
    if (statsErrorStatus !== 401) return;
    if (typeof window === 'undefined') return;

    window.location.assign('/login');
  }, [statsErrorStatus]);

  if (!canSeeVehicleStats) return null;
  if (statsErrorStatus === 403) return null;

  if (vehiclesStatsStatus === 'idle' || vehiclesStatsStatus === 'loading') {
    return (
      <StatsCardsSection>
        <StatsCardSkeleton variant="teal" data-testid="vehicles-stats-skeleton-total" />
        <StatsCardSkeleton variant="green" data-testid="vehicles-stats-skeleton-active" />
        <StatsCardSkeleton variant="yellow" data-testid="vehicles-stats-skeleton-inactive" />
        <StatsCardSkeleton variant="navy" data-testid="vehicles-stats-skeleton-new" />
      </StatsCardsSection>
    );
  }

  if (vehiclesStatsStatus === 'failed') {
    if (statsErrorStatus === 401) return null;
    if (statsErrorStatus === 403) return null;

    return (
      <StatsCardsSection>
        <Alert
          severity="error"
          action={
            tenantSlug ? (
              <Button
                color="inherit"
                size="small"
                data-testid="vehicles-stats-retry"
                onClick={() => {
                  void dispatch(fetchVehiclesStats({ tenantSlug, force: true }));
                }}
              >
                Reintentar
              </Button>
            ) : null
          }
        >
          No se pudieron cargar las estadísticas de vehículos.
        </Alert>
      </StatsCardsSection>
    );
  }

  const stats = vehiclesStatsData;
  if (!stats) return null;

  const totalHelperText = stats.total_prev_month === 0
    ? '100%+ vs mes anterior'
    : `${stats.delta_total_pct_vs_prev_month.toFixed(1)}% vs mes anterior`;

  const deltaUi = buildDeltaUi(stats.delta_new_vs_prev_month);

  return (
    <StatsCardsSection>
      <StatsCard
        title="Total flota"
        value={stats.total}
        helperText={totalHelperText}
        variant="secondary"
        icon={<DirectionsBusIcon />}
        data-testid="vehicles-stats-total"
      />

      <StatsCard
        title="Operativos"
        value={stats.active}
        helperText={`${formatPercent(stats.active_pct_of_total)} del total`}
        variant="success"
        icon={<CheckCircleIcon />}
        data-testid="vehicles-stats-active"
      />

      <StatsCard
        title="Inactivos"
        value={stats.inactive}
        helperText={`${formatPercent(stats.inactive_pct_of_total)} del total`}
        variant="warning"
        icon={<CancelIcon />}
        data-testid="vehicles-stats-inactive"
      />

      <StatsCard
        title="Nuevos este mes"
        value={stats.new_this_month}
        helperText={deltaUi.helperText}
        helperIcon={deltaUi.helperIcon}
        variant="primary"
        icon={<TimelineIcon />}
        data-testid="vehicles-stats-new-this-month"
      />
    </StatsCardsSection>
  );
};

export default VehiclesStatsCards;
