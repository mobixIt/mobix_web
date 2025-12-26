import { describe, it, expect } from 'vitest';
import { mapAiFiltersDisplay, buildAiQuestionFromFilters } from '@/components/vehicles/strategies/base/BaseVehicles';

describe('mapAiFiltersDisplay', () => {
  it('skips null values and formats the rest', () => {
    const display = mapAiFiltersDisplay({
      status: null,
      date: undefined,
      brand: 'hino',
      capacity_total_gt: null,
      color: '',
    });

    expect(display).toEqual({
      brand: 'Marca: Hino',
    });
  });

  it('capitalizes labels without a mapping', () => {
    const display = mapAiFiltersDisplay({ custom_field: 'value' });
    expect(display).toEqual({ custom_field: 'Custom field: Value' });
  });

  it('uses number from question when capacity is zero', () => {
    const display = mapAiFiltersDisplay({ capacity_total_gt: 0 }, 'vehículos con capacidad mayor a 40');
    expect(display).toEqual({ capacity_total_gt: 'Capacidad Total (>): 40' });
  });

  it('omits capacity when no number can be inferred', () => {
    const display = mapAiFiltersDisplay({ capacity_total_lt: 0 }, 'vehículos sin capacidad definida');
    expect(display).toEqual({});
  });
});

describe('buildAiQuestionFromFilters', () => {
  it('builds a coherent prompt', () => {
    const question = buildAiQuestionFromFilters({ brand: 'Hino', vehicle_class: 'buseta' });
    expect(question).toBe('vehículos marca Hino clase buseta');
  });

  it('returns empty when no valid filters', () => {
    const question = buildAiQuestionFromFilters({ brand: null, capacity_total_gt: undefined });
    expect(question).toBe('');
  });
});
