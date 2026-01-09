import { describe, it, expect } from 'vitest';

import {
  mapAiFiltersDisplay,
  buildAiQuestionFromFilters,
} from '@/components/vehicles/actions/index/strategies/base/BaseVehiclesStrategy';

describe('mapAiFiltersDisplay', () => {
  it('translates status values to Spanish and keeps each entry', () => {
    const display = mapAiFiltersDisplay({ status: ['active', 'maintenance'] }, null);
    expect(display).toEqual({
      'status::0': 'Estado: Activo',
      'status::1': 'Estado: Mantenimiento',
    });
  });

  it('formats body type with multiple values and proper keys', () => {
    const display = mapAiFiltersDisplay({ body_type: ['articulado', 'van'] }, null);
    expect(display).toEqual({
      'body_type::0': 'Carrocería: Articulado',
      'body_type::1': 'Carrocería: Van',
    });
  });

  it('replaces zero capacity with number extracted from question', () => {
    const display = mapAiFiltersDisplay(
      { capacity_total_gt: '0' },
      'carros con capacidad mayor a 40',
    );
    expect(display).toEqual({
      capacity_total_gt: 'Capacidad Total (>): 40',
    });
  });

  it('deduplicates identical values only, preserving distinct entries', () => {
    const display = mapAiFiltersDisplay(
      { brand: ['mercedes', 'mercedes', 'hino'] },
      null,
    );
    expect(display).toEqual({
      'brand::0': 'Marca: Mercedes',
      'brand::1': 'Marca: Hino',
    });
  });
});

describe('buildAiQuestionFromFilters', () => {
  it('builds a question joining multiple values with translations applied to status', () => {
    const question = buildAiQuestionFromFilters({
      status: ['active', 'inactive'],
      brand: ['mercedes', 'chevrolet'],
    });
    expect(question).toBe('vehículos estado activo o inactivo marca mercedes o chevrolet');
  });

  it('returns empty string when no usable filters are provided', () => {
    const question = buildAiQuestionFromFilters({
      status: [],
      model_year: '',
    });
    expect(question).toBe('');
  });
});
