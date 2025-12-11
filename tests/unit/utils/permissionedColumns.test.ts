import { describe, it, expect } from 'vitest';
import {
  buildColumnsFromAttributes,
  getDefaultVisibleColumnIds,
} from '@/utils/permissionedColumns';
import type { MobixTableColumn } from '@/components/mobix/table';

type TestRow = {
  id: number;
  plate: string;
  status: string;
  model_year: number;
};

const allColumns: MobixTableColumn<TestRow>[] = [
  { id: 'id', field: 'id', label: 'ID' },
  { id: 'plate', field: 'plate', label: 'Plate' },
  { id: 'status', field: 'status', label: 'Status' },
  { id: 'model_year', field: 'model_year', label: 'Model year' },
];

describe('buildColumnsFromAttributes', () => {
  it('returns empty array when allowedAttributes is null and no minimalSafeFields or alwaysVisibleFields', () => {
    const result = buildColumnsFromAttributes<TestRow>([...allColumns], null, {
      minimalSafeFields: [],
      alwaysVisibleFields: [],
    });

    expect(result).toEqual([]);
  });

  it('returns only minimalSafeFields when allowedAttributes is null and minimalSafeFields are provided', () => {
    const result = buildColumnsFromAttributes<TestRow>([...allColumns], null, {
      minimalSafeFields: ['plate', 'model_year'],
      alwaysVisibleFields: [],
    });

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'model_year']);
  });

  it('returns only alwaysVisibleFields when allowedAttributes is null and only alwaysVisibleFields are provided', () => {
    const result = buildColumnsFromAttributes<TestRow>([...allColumns], null, {
      minimalSafeFields: [],
      alwaysVisibleFields: ['status'],
    });

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['status']);
  });

  it('returns union of minimalSafeFields and alwaysVisibleFields when allowedAttributes is null', () => {
    const result = buildColumnsFromAttributes<TestRow>([...allColumns], null, {
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status', 'model_year'],
    });

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'status', 'model_year']);
  });

  it('ignores fields in minimalSafeFields/alwaysVisibleFields that are not present in allColumns', () => {
    const result = buildColumnsFromAttributes<TestRow>([...allColumns], null, {
      minimalSafeFields: ['plate', 'nonexistent'],
      alwaysVisibleFields: ['status', 'another_missing'],
    });

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'status']);
  });

  it('returns all columns when allowedAttributes is an empty array (full access)', () => {
    const result = buildColumnsFromAttributes<TestRow>([...allColumns], [], {
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    });

    expect(result).toHaveLength(allColumns.length);
    expect(result.map((c) => c.field)).toEqual(allColumns.map((c) => c.field));
  });

  it('returns only allowedAttributes when provided and no alwaysVisibleFields', () => {
    const result = buildColumnsFromAttributes<TestRow>(
      [...allColumns],
      ['plate', 'model_year'],
      {
        minimalSafeFields: ['id'],
        alwaysVisibleFields: [],
      },
    );

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'model_year']);
  });

  it('returns allowedAttributes plus alwaysVisibleFields', () => {
    const result = buildColumnsFromAttributes<TestRow>(
      [...allColumns],
      ['plate'],
      {
        minimalSafeFields: ['id'],
        alwaysVisibleFields: ['status'],
      },
    );

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'status']);
  });

  it('preserves original column order based on allColumns, not allowedAttributes order', () => {
    const result = buildColumnsFromAttributes<TestRow>(
      [...allColumns],
      ['model_year', 'plate'],
      {
        minimalSafeFields: [],
        alwaysVisibleFields: [],
      },
    );

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'model_year']);
  });

  it('ignores attributes that do not exist in allColumns', () => {
    const result = buildColumnsFromAttributes<TestRow>(
      [...allColumns],
      ['plate', 'nonexistent_field'],
      {
        minimalSafeFields: [],
        alwaysVisibleFields: [],
      },
    );

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate']);
  });

  it('includes alwaysVisibleFields even if not present in allowedAttributes', () => {
    const result = buildColumnsFromAttributes<TestRow>(
      [...allColumns],
      ['plate'],
      {
        minimalSafeFields: [],
        alwaysVisibleFields: ['status'],
      },
    );

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate', 'status']);
  });

  it('ignores alwaysVisibleFields that are not present in allColumns', () => {
    const result = buildColumnsFromAttributes<TestRow>(
      [...allColumns],
      ['plate'],
      {
        minimalSafeFields: [],
        alwaysVisibleFields: ['missing_field'],
      },
    );

    const fields = result.map((c) => c.field);
    expect(fields).toEqual(['plate']);
  });

  it('does not mutate the original allColumns array', () => {
    const snapshot = [...allColumns];
    const result = buildColumnsFromAttributes<TestRow>(
      allColumns,
      ['plate'],
      {
        minimalSafeFields: [],
        alwaysVisibleFields: ['status'],
      },
    );

    expect(allColumns).toEqual(snapshot);
    expect(result.map((c) => c.field)).toEqual(['plate', 'status']);
  });

  it('handles empty allColumns by always returning an empty array', () => {
    const res1 = buildColumnsFromAttributes<TestRow>([], null, {
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    });

    const res2 = buildColumnsFromAttributes<TestRow>([], [], {
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    });

    const res3 = buildColumnsFromAttributes<TestRow>([], ['plate', 'status'], {
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    });

    expect(res1).toEqual([]);
    expect(res2).toEqual([]);
    expect(res3).toEqual([]);
  });
});

describe('getDefaultVisibleColumnIds', () => {
  it('returns all column ids as strings', () => {
    const columns: MobixTableColumn<TestRow>[] = [
      { id: 'id', field: 'id', label: 'ID' },
      { id: '2', field: 'plate', label: 'Plate' },
      { id: 'status', field: 'status', label: 'Status' },
    ];

    const result = getDefaultVisibleColumnIds<TestRow>(columns);
    expect(result).toEqual(['id', '2', 'status']);
  });

  it('returns an empty array when no columns are provided', () => {
    const result = getDefaultVisibleColumnIds<TestRow>([]);
    expect(result).toEqual([]);
  });

  it('does not mutate the input columns array', () => {
    const columns: MobixTableColumn<TestRow>[] = [
      { id: 'id', field: 'id', label: 'ID' },
      { id: 'plate', field: 'plate', label: 'Plate' },
    ];

    const snapshot = [...columns];
    const result = getDefaultVisibleColumnIds<TestRow>(columns);

    expect(columns).toEqual(snapshot);
    expect(result).toEqual(['id', 'plate']);
  });
});
