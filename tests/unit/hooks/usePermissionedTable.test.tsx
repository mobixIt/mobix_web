import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import {
  usePermissionedTable,
  type UsePermissionedTableArgs,
  type UsePermissionedTableResult,
} from '@/hooks/usePermissionedTable';
import type { MobixTableColumn } from '@/components/mobix/table';

interface TestRow {
  id: number;
  plate: string;
  status: string;
  model_year: number;
}

const ALL_COLUMNS: MobixTableColumn<TestRow>[] = [
  { id: 'plate', field: 'plate', label: 'Plate' },
  { id: 'status', field: 'status', label: 'Status' },
  { id: 'model_year', field: 'model_year', label: 'Model year' },
];

interface TestComponentProps {
  args: UsePermissionedTableArgs<TestRow>;
  onRender: (result: UsePermissionedTableResult<TestRow>) => void;
}

function TestComponent({ args, onRender }: TestComponentProps) {
  const result = usePermissionedTable<TestRow>(args);
  React.useEffect(() => {
    onRender(result);
  }, [result, onRender]);
  return null;
}

function renderUsePermissionedTable(
  args: UsePermissionedTableArgs<TestRow>,
) {
  let latestResult: UsePermissionedTableResult<TestRow> | null = null;

  const handleRender = (result: UsePermissionedTableResult<TestRow>) => {
    latestResult = result;
  };

  const { rerender } = render(
    <TestComponent args={args} onRender={handleRender} />,
  );

  return {
    getResult: () => latestResult,
    rerender: (newArgs: UsePermissionedTableArgs<TestRow>) =>
      rerender(<TestComponent args={newArgs} onRender={handleRender} />),
  };
}

describe('usePermissionedTable', () => {
  it('returns empty columns and not ready state when permissions are not ready (allowedAttributes is null)', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: 123,
      allColumns: ALL_COLUMNS,
      allowedAttributes: null,
      minimalSafeFields: ['plate', 'status'],
      alwaysVisibleFields: ['status'],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.permissionsReady).toBe(false);
    expect(result.columns).toEqual([]);
    expect(result.defaultVisibleColumnIds).toEqual([]);
    expect(result.columnVisibilityStorageKey).toBeUndefined();
    expect(result.isReady).toBe(false);
  });

  it('ignores minimalSafeFields and alwaysVisibleFields while permissions are not ready', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: 123,
      allColumns: ALL_COLUMNS,
      allowedAttributes: null,
      minimalSafeFields: ['plate', 'model_year', 'status'],
      alwaysVisibleFields: ['status'],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.columns).toEqual([]);
    expect(result.defaultVisibleColumnIds).toEqual([]);
    expect(result.isReady).toBe(false);
  });

  it('returns all columns and ready state when allowedAttributes is an empty array and tenant/user are present', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: 42,
      allColumns: ALL_COLUMNS,
      allowedAttributes: [],
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.permissionsReady).toBe(true);
    expect(result.columns.map((c) => c.id)).toEqual(
      ALL_COLUMNS.map((c) => c.id),
    );
    expect(result.defaultVisibleColumnIds).toEqual(
      ALL_COLUMNS.map((c) => c.id),
    );
    expect(typeof result.columnVisibilityStorageKey).toBe('string');
    expect(result.columnVisibilityStorageKey).toContain('vehicles');
    expect(result.isReady).toBe(true);
  });

  it('does not generate storage key or ready state when tenantSlug is null even if permissions are ready', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: null,
      userId: 42,
      allColumns: ALL_COLUMNS,
      allowedAttributes: [],
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.permissionsReady).toBe(true);
    expect(result.columns.map((c) => c.id)).toEqual(
      ALL_COLUMNS.map((c) => c.id),
    );
    expect(result.columnVisibilityStorageKey).toBeUndefined();
    expect(result.isReady).toBe(false);
  });

  it('does not generate storage key or ready state when userId is null even if permissions are ready', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: null,
      allColumns: ALL_COLUMNS,
      allowedAttributes: [],
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.permissionsReady).toBe(true);
    expect(result.columns.map((c) => c.id)).toEqual(
      ALL_COLUMNS.map((c) => c.id),
    );
    expect(result.columnVisibilityStorageKey).toBeUndefined();
    expect(result.isReady).toBe(false);
  });

  it('generates storage key but is not ready when resulting columns array is empty', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: 99,
      allColumns: ALL_COLUMNS,
      allowedAttributes: ['nonexistent_field'],
      minimalSafeFields: [],
      alwaysVisibleFields: [],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.permissionsReady).toBe(true);
    expect(result.columns).toEqual([]);
    expect(typeof result.columnVisibilityStorageKey).toBe('string');
    expect(result.isReady).toBe(false);
  });

  it('returns empty arrays and not ready when allColumns is empty, even if permissions and tenant/user are valid', () => {
    const args: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: 10,
      allColumns: [],
      allowedAttributes: [],
      minimalSafeFields: ['plate'],
      alwaysVisibleFields: ['status'],
    };

    const { getResult } = renderUsePermissionedTable(args);
    const result = getResult() as UsePermissionedTableResult<TestRow>;

    expect(result.permissionsReady).toBe(true);
    expect(result.columns).toEqual([]);
    expect(result.defaultVisibleColumnIds).toEqual([]);
    expect(typeof result.columnVisibilityStorageKey).toBe('string');
    expect(result.isReady).toBe(false);
  });

  it('recomputes columns and visibility key when allowedAttributes change', () => {
    const baseArgs: UsePermissionedTableArgs<TestRow> = {
      tableId: 'vehicles',
      tenantSlug: 'tenant-1',
      userId: 5,
      allColumns: ALL_COLUMNS,
      allowedAttributes: ['plate'],
      minimalSafeFields: [],
      alwaysVisibleFields: ['status'],
    };

    const { getResult, rerender } = renderUsePermissionedTable(baseArgs);
    const first = getResult() as UsePermissionedTableResult<TestRow>;

    expect(first.permissionsReady).toBe(true);
    expect(first.columns.map((c) => c.field)).toEqual(['plate', 'status']);
    const firstKey = first.columnVisibilityStorageKey as string;

    const updatedArgs: UsePermissionedTableArgs<TestRow> = {
      ...baseArgs,
      allowedAttributes: ['model_year'],
    };

    rerender(updatedArgs);
    const second = getResult() as UsePermissionedTableResult<TestRow>;

    expect(second.columns.map((c) => c.field)).toEqual([
      'status',
      'model_year',
    ]);
    const secondKey = second.columnVisibilityStorageKey as string;

    expect(secondKey).not.toBe(firstKey);
    expect(second.isReady).toBe(true);
  });
});
