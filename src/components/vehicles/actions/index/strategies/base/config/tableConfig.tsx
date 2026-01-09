import * as React from 'react';
import type { ReactNode } from 'react';
import {
  mapStatusToLabel,
  mapStatusToVariant,
} from '@/utils/statusHelpers';
import type { Vehicle } from '@/types/vehicles/api';

import type { MobixTableColumn } from '@/components/mobix/table';
import StatusPill from '@/components/mobix/status-pill/StatusPill';

export type VehicleRow = {
  id: string;
  plate?: string;
  model_year: string;
  color?: string;
  engine_number?: string;
  chassis_number?: string;
  seated_capacity?: number;
  standing_capacity?: number;
  property_card?: string;

  brand?: string;
  vehicle_class?: string;
  body_type?: string;

  status: ReactNode;
};

export type VehicleLike = Partial<Omit<Vehicle, 'id'>> & {
  id: Vehicle['id'];
};

export const ALL_VEHICLE_COLUMNS: MobixTableColumn<VehicleRow>[] = [
  { id: 'plate', label: 'Placa', field: 'plate', hideable: false },
  { id: 'model_year', label: 'Modelo', field: 'model_year' },
  { id: 'color', label: 'Color', field: 'color' },
  { id: 'engine_number', label: 'Motor', field: 'engine_number' },
  { id: 'chassis_number', label: 'Chasis', field: 'chassis_number' },
  { id: 'seated_capacity', label: 'Sentados', field: 'seated_capacity' },
  { id: 'standing_capacity', label: 'De pie', field: 'standing_capacity' },
  { id: 'property_card', label: 'Tarj. Propiedad', field: 'property_card' },
  { id: 'brand', label: 'Marca', field: 'brand' },
  { id: 'vehicle_class', label: 'Clase', field: 'vehicle_class' },
  { id: 'body_type', label: 'Carrocería', field: 'body_type' },
  { id: 'status', label: 'Estado', field: 'status' },
];

export function mapVehiclesToRows(
  vehicles: VehicleLike[] | undefined | null,
): VehicleRow[] {
  if (!Array.isArray(vehicles)) return [];

  return vehicles.map((v) => ({
    id: String(v.id ?? ''),
    plate: v.plate != null ? String(v.plate) : undefined,
    model_year: v.model_year != null ? String(v.model_year) : '',
    color: v.color != null ? String(v.color) : undefined,
    engine_number: v.engine_number ?? undefined,
    chassis_number: v.chassis_number ?? undefined,
    seated_capacity: v.seated_capacity ?? undefined,
    standing_capacity: v.standing_capacity ?? undefined,
    property_card: v.property_card ?? undefined,

    brand: v.brand
      ? v.brand.name ?? v.brand.label ?? undefined
      : undefined,
    vehicle_class: v.vehicle_class
      ? v.vehicle_class.name ?? v.vehicle_class.label ?? undefined
      : undefined,
    body_type: v.body_type
      ? v.body_type.name ?? v.body_type.label ?? undefined
      : undefined,

    status: (
      <StatusPill
        label={mapStatusToLabel(v.status)}
        variant={mapStatusToVariant(v.status)}
      />
    ),
  }));
}
