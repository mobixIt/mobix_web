import { describe, it, expect } from 'vitest';
import { mapAiFiltersDisplay, buildAiQuestionFromFilters } from '@/components/vehicles/strategies/base/BaseVehicles';

describe('mapAiFiltersDisplay', () => {
  it('omite valores nulos y formatea los válidos', () => {
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

  it('capitaliza etiquetas sin mapeo', () => {
    const display = mapAiFiltersDisplay({ custom_field: 'value' });
    expect(display).toEqual({ custom_field: 'Custom field: Value' });
  });

  it('usa el número de la pregunta cuando capacidad es cero', () => {
    const display = mapAiFiltersDisplay({ capacity_total_gt: 0 }, 'vehículos con capacidad mayor a 40');
    expect(display).toEqual({ capacity_total_gt: 'Capacidad Total (>): 40' });
  });

  it('omite capacidad cuando no puede inferir número', () => {
    const display = mapAiFiltersDisplay({ capacity_total_lt: 0 }, 'vehículos sin capacidad definida');
    expect(display).toEqual({});
  });
});

describe('buildAiQuestionFromFilters', () => {
  it('construye un prompt coherente', () => {
    const question = buildAiQuestionFromFilters({ brand: 'Hino', vehicle_class: 'buseta' });
    expect(question).toBe('vehículos marca Hino clase buseta');
  });

  it('devuelve vacío si no hay filtros válidos', () => {
    const question = buildAiQuestionFromFilters({ brand: null, capacity_total_gt: undefined });
    expect(question).toBe('');
  });
});
