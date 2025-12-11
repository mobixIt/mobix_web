import { describe, it, expect } from 'vitest';

import {
  isActiveStatus,
  isInactiveStatus,
  mapStatusToLabel,
  mapStatusToVariant,
  type RawStatus,
} from '@/utils/statusHelpers';

describe('statusHelpers', () => {
  describe('isActiveStatus', () => {
    const activeValues: RawStatus[] = [
      true,
      1,
      '1',
      'true',
      'TRUE',
      '  true  ',
      'active',
      'ACTIVE',
      '  Active ',
      'activo',
      'ACTIVO',
    ];

    const inactiveValues: RawStatus[] = [
      false,
      0,
      '0',
      'false',
      'FALSE',
      'inactive',
      'INACTIVE',
      'inactivo',
      'INACTIVO',
      null,
      undefined,
      '',
      '   ',
      'unknown',
      2,
      '2',
    ];

    it.each(activeValues)('returns true for active value %p', (value) => {
      expect(isActiveStatus(value)).toBe(true);
    });

    it.each(inactiveValues)('returns false for non-active value %p', (value) => {
      expect(isActiveStatus(value)).toBe(false);
    });
  });

  describe('isInactiveStatus', () => {
    const inactiveValues: RawStatus[] = [
      false,
      0,
      '0',
      'false',
      'FALSE',
      'inactive',
      'INACTIVE',
      'inactivo',
      'INACTIVO',
    ];

    const activeValues: RawStatus[] = [
      true,
      1,
      '1',
      'true',
      'TRUE',
      'active',
      'ACTIVE',
      'activo',
      'ACTIVO',
    ];

    it.each(inactiveValues)('returns true for inactive value %p', (value) => {
      expect(isInactiveStatus(value)).toBe(true);
    });

    it.each(activeValues)('returns false for non-inactive value %p', (value) => {
      expect(isInactiveStatus(value)).toBe(false);
    });

    it.each<[RawStatus]>([
      [null],
      [undefined],
      [''],
      ['   '],
      ['unknown'],
      [2],
      ['2'],
    ])('returns false for unknown value %p', (value) => {
      expect(isInactiveStatus(value)).toBe(false);
    });
  });

  describe('mapStatusToLabel', () => {
    it.each<RawStatus>([
      true,
      1,
      '1',
      'true',
      'TRUE',
      'active',
      'ACTIVE',
      'activo',
      'ACTIVO',
      '  activo ',
    ])('returns "Activo" for active value %p', (value) => {
      expect(mapStatusToLabel(value)).toBe('Activo');
    });

    it.each<RawStatus>([
      false,
      0,
      '0',
      'false',
      'FALSE',
      'inactive',
      'INACTIVE',
      'inactivo',
      'INACTIVO',
      '  inactivo ',
    ])('returns "Inactivo" for inactive value %p', (value) => {
      expect(mapStatusToLabel(value)).toBe('Inactivo');
    });

    it.each<RawStatus>([
      null,
      undefined,
      '',
      '   ',
      'unknown',
      2,
      '2',
    ])('defaults to "Inactivo" for unknown value %p', (value) => {
      expect(mapStatusToLabel(value)).toBe('Inactivo');
    });
  });

  describe('mapStatusToVariant', () => {
    it.each<RawStatus>([
      true,
      1,
      '1',
      'true',
      'TRUE',
      'active',
      'ACTIVE',
      'activo',
      'ACTIVO',
    ])('returns "active" for active value %p', (value) => {
      expect(mapStatusToVariant(value)).toBe('active');
    });

    it.each<RawStatus>([
      false,
      0,
      '0',
      'false',
      'FALSE',
      'inactive',
      'INACTIVE',
      'inactivo',
      'INACTIVO',
      null,
      undefined,
      '',
      '   ',
      'unknown',
      2,
      '2',
    ])('returns "inactive" for non-active value %p', (value) => {
      expect(mapStatusToVariant(value)).toBe('inactive');
    });
  });
});
