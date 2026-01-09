import * as React from 'react';
import type { MobixTableColumn } from '@/components/mobix/table';
import {
  buildColumnsFromAttributes,
  getDefaultVisibleColumnIds,
  type BuildColumnsOptions,
} from '@/utils/permissionedColumns';
import { buildColumnVisibilityStorageKey } from '@/utils/columnVisibilityStorage';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface UsePermissionedTableArgs<TRow> extends BuildColumnsOptions {
  /**
   * Unique identifier for the table.
   * Example: 'vehicles', 'routes', 'drivers'
   */
  tableId: string;

  /**
   * Current tenant slug (multitenant scope).
   */
  tenantSlug: string | null;

  /**
   * Current authenticated user id.
   */
  userId: number | null;

  /**
   * Full list of all possible columns for the table.
   */
  allColumns: MobixTableColumn<TRow>[];

  /**
   * Allowed attributes coming from permissions.
   * - null  → permissions still loading
   * - []    → full access
   * - [...] → limited set of columns
   */
  allowedAttributes: string[] | null;
}

export interface UsePermissionedTableResult<TRow> {
  /**
   * Final computed columns that should be rendered.
   */
  columns: MobixTableColumn<TRow>[];

  /**
   * List of column IDs that should be visible by default.
   * This is passed to MobixTable as `initialVisibleColumnIds`.
   */
  defaultVisibleColumnIds: string[];

  /**
   * Fully scoped localStorage key:
   * includes tableId + tenant + user + permissions hash.
   */
  columnVisibilityStorageKey?: string;

  /**
   * Indicates whether permissions have finished loading.
   */
  permissionsReady: boolean;

  /**
   * Indicates whether the table is fully ready to be rendered:
   * - permissions ready
   * - columns computed
   * - storage key available
   */
  isReady: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                HOW TO USE                                  */
/* -------------------------------------------------------------------------- */
/*
USAGE EXAMPLE (Vehicles index):

import { usePermissionedTable } from '@/hooks/usePermissionedTable';
import { ALL_VEHICLE_COLUMNS } from '@/components/vehicles/actions/index/strategies/base/config/tableConfig';

const {
  columns,
  defaultVisibleColumnIds,
  columnVisibilityStorageKey,
  isReady,
} = usePermissionedTable<VehicleRow>({
  tableId: 'vehicles',
  tenantSlug,
  userId: currentUserId,
  allowedAttributes: allowedVehicleAttributes,
  allColumns: ALL_VEHICLE_COLUMNS,

  // Shown only if permissions are still loading (optional)
  minimalSafeFields: ['plate', 'model_year', 'status'],

  // Always visible even if not included in permissions
  alwaysVisibleFields: ['status'],
});

Then in the render:

if (!isReady) {
  return <Spinner />;
}

return (
  <MobixTable
    columns={columns}
    initialVisibleColumnIds={defaultVisibleColumnIds}
    columnVisibilityStorageKey={columnVisibilityStorageKey}
    ...
  />
);
*/

/* -------------------------------------------------------------------------- */
/*                                 THE HOOK                                   */
/* -------------------------------------------------------------------------- */

/**
 * Generic hook to build permission-based table columns and a scoped
 * localStorage key including tenant, user and allowed attributes.
 *
 * This is meant to be reused by any index page that:
 * - uses a MobixTable
 * - has per-tenant & per-user column permissions.
 */
export function usePermissionedTable<TRow>(
  args: UsePermissionedTableArgs<TRow>,
): UsePermissionedTableResult<TRow> {
  const {
    tableId,
    tenantSlug,
    userId,
    allColumns,
    allowedAttributes,
    minimalSafeFields,
    alwaysVisibleFields,
  } = args;

  // We consider permissions "ready" when the selector returns non-null.
  // null means: still computing / not loaded.
  const permissionsReady = allowedAttributes !== null;

  // When permissions are not ready we return an empty array of columns to
  // avoid the intermediate "minimal safe" UI flicker. The caller can show
  // a spinner until isReady === true.
  const columns = React.useMemo(
    () => {
      if (!permissionsReady) return [];

      return buildColumnsFromAttributes<TRow>(
        allColumns,
        allowedAttributes ?? [],
        {
          minimalSafeFields,
          alwaysVisibleFields,
        },
      );
    },
    [
      permissionsReady,
      allColumns,
      allowedAttributes,
      minimalSafeFields,
      alwaysVisibleFields,
    ],
  );

  const defaultVisibleColumnIds = React.useMemo(
    () => getDefaultVisibleColumnIds(columns),
    [columns],
  );

  const columnVisibilityStorageKey = React.useMemo(() => {
    if (!permissionsReady) return undefined;
    if (!tenantSlug || !userId) return undefined;

    return buildColumnVisibilityStorageKey({
      tableId,
      tenantSlug,
      userId,
      allowedAttributes,
    });
  }, [permissionsReady, tableId, tenantSlug, userId, allowedAttributes]);

  const isReady =
    permissionsReady &&
    columns.length > 0 &&
    !!columnVisibilityStorageKey;

  return {
    columns,
    defaultVisibleColumnIds,
    columnVisibilityStorageKey,
    permissionsReady,
    isReady,
  };
}
