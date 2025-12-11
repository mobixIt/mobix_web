import type { MobixTableColumn } from '@/components/mobix/table';

export interface BuildColumnsOptions {
  /**
   * Fields considered as a "minimal safe" set when allowedAttributes is null
   * (permissions not loaded yet). If empty, the caller can decide to not show
   * any columns until permissions are ready.
   */
  minimalSafeFields?: string[];

  /**
   * Fields that should always be visible whenever there are columns,
   * regardless of whether they are explicitly listed in allowedAttributes.
   * Typical example: "status".
   */
  alwaysVisibleFields?: string[];
}

/**
 * Generic builder to derive visible columns from a full list of columns and
 * a list of allowed attributes coming from permissions.
 *
 * Conventions:
 * - allowedAttributes === null → minimalSafeFields + alwaysVisibleFields.
 * - allowedAttributes.length === 0 → full access → allColumns.
 * - allowedAttributes with values → only those fields + alwaysVisibleFields.
 *
 * NOTE: If you want to "wait" for permissions (spinner until ready),
 * simply do NOT call this function while allowedAttributes === null.
 */
export function buildColumnsFromAttributes<TRow>(
  allColumns: MobixTableColumn<TRow>[],
  allowedAttributes: string[] | null,
  options: BuildColumnsOptions = {},
): MobixTableColumn<TRow>[] {
  const {
    minimalSafeFields = [],
    alwaysVisibleFields = [],
  } = options;

  // Permissions not ready → minimal safe set
  if (allowedAttributes === null) {
    if (minimalSafeFields.length === 0 && alwaysVisibleFields.length === 0) {
      return [];
    }

    const safeSet = new Set([
      ...minimalSafeFields,
      ...alwaysVisibleFields,
    ]);

    return allColumns.filter((col) =>
      safeSet.has(col.field as string),
    );
  }

  // Empty array → full access → return everything
  if (allowedAttributes.length === 0) {
    return allColumns;
  }

  const allowedSet = new Set(allowedAttributes);
  const alwaysVisibleSet = new Set(alwaysVisibleFields);

  return allColumns.filter((col) => {
    const field = col.field as string;
    return allowedSet.has(field) || alwaysVisibleSet.has(field);
  });
}

/**
 * Helper to derive default visible column ids from a column list.
 */
export function getDefaultVisibleColumnIds<TRow>(
  columns: MobixTableColumn<TRow>[],
): string[] {
  return columns.map((col) => String(col.id));
}
