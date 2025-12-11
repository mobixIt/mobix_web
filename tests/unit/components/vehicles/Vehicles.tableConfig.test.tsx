import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  mapVehiclesToRows,
  type VehicleLike,
} from '@/components/vehicles/Vehicles.tableConfig';

vi.mock('@/utils/statusHelpers', () => ({
  mapStatusToLabel: (status: unknown) => `label-${String(status)}`,
  mapStatusToVariant: (status: unknown) => `variant-${String(status)}`,
}));

vi.mock('@/components/mobix/status-pill/StatusPill', () => ({
  __esModule: true,
  default: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-pill">
      {label}:{variant}
    </span>
  ),
}));

describe('mapVehiclesToRows pure mapping behavior for multiple vehicle input shapes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when vehicles input is undefined', () => {
    const result = mapVehiclesToRows(undefined);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when vehicles input is null', () => {
    const result = mapVehiclesToRows(null);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when vehicles input is not an array', () => {
    const result = mapVehiclesToRows({} as unknown as VehicleLike[]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('maps basic vehicle fields to VehicleRow preserving ids and model_year', () => {
    const vehicles: VehicleLike[] = [
      {
        id: 123,
        plate: 'ABC123',
        model_year: 2020,
        status: 'active',
      } as unknown as VehicleLike,
    ];

    const rows = mapVehiclesToRows(vehicles);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('123');
    expect(rows[0].plate).toBe('ABC123');
    expect(rows[0].model_year).toBe('2020');
  });

  it('normalizes brand, vehicle_class and body_type from nested label or name fields', () => {
    const vehicles: VehicleLike[] = [
      {
        id: 'veh-1',
        model_year: '2019',
        status: 'inactive',
        brand: { name: 'Mercedes' } as unknown as VehicleLike['brand'],
        vehicle_class: { label: 'Buseta' } as unknown as VehicleLike['vehicle_class'],
        body_type: { name: 'Microbus' } as unknown as VehicleLike['body_type'],
      } as unknown as VehicleLike,
    ];

    const rows = mapVehiclesToRows(vehicles);
    expect(rows).toHaveLength(1);
    expect(rows[0].brand).toBe('Mercedes');
    expect(rows[0].vehicle_class).toBe('Buseta');
    expect(rows[0].body_type).toBe('Microbus');
  });

  it('leaves optional fields undefined when source vehicle omits them', () => {
    const vehicles: VehicleLike[] = [
      {
        id: 'veh-2',
        model_year: '2018',
        status: 'active',
      } as unknown as VehicleLike,
    ];

    const rows = mapVehiclesToRows(vehicles);
    expect(rows[0].plate).toBeUndefined();
    expect(rows[0].color).toBeUndefined();
    expect(rows[0].engine_number).toBeUndefined();
    expect(rows[0].chassis_number).toBeUndefined();
    expect(rows[0].seated_capacity).toBeUndefined();
    expect(rows[0].standing_capacity).toBeUndefined();
    expect(rows[0].property_card).toBeUndefined();
  });

  it('wraps status with StatusPill using mapped label and variant', () => {
    const vehicles: VehicleLike[] = [
      {
        id: 'veh-3',
        model_year: '2022',
        status: 'maintenance',
      } as unknown as VehicleLike,
    ];

    const rows = mapVehiclesToRows(vehicles);
    const { status } = rows[0];
    render(<div>{status}</div>);

    const pill = screen.getByTestId('status-pill');
    expect(pill).toHaveTextContent('label-maintenance:variant-maintenance');
  });

  it('uses empty string id when vehicle id is missing or null', () => {
    const vehicles: VehicleLike[] = [
      {
        id: undefined as unknown as VehicleLike['id'],
        model_year: '2021',
        status: 'active',
      } as unknown as VehicleLike,
    ];

    const rows = mapVehiclesToRows(vehicles);
    expect(rows[0].id).toBe('');
  });

  it('casts numeric plate and model_year to strings to keep table values consistent', () => {
    const vehicles: VehicleLike[] = [
      {
        id: 1,
        plate: 999,
        model_year: 2015,
        status: 'active',
      } as unknown as VehicleLike,
    ];

    const rows = mapVehiclesToRows(vehicles);
    expect(rows[0].plate).toBe('999');
    expect(rows[0].model_year).toBe('2015');
  });
});
