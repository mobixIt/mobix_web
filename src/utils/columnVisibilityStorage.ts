// TTL for column visibility config (in milliseconds).
// Example: 24 hours.
const COLUMN_VISIBILITY_TTL_MS = 24 * 60 * 60 * 1000;

interface ColumnVisibilityKeyParams {
  tableId: string;                // e.g. "vehicles"
  tenantSlug: string | null;
  userId: string | number | null; // identifier for current user
  allowedAttributes: string[] | null;
}

/**
 * Builds a scoped, versioned and time-bucketed key for column visibility.
 *
 * Dimensions:
 * - tableId: table identifier (vehicles, routes, etc.)
 * - tenantSlug: current tenant
 * - userId: current user
 * - attrsHash: signature of allowed attributes (permissions)
 * - bucket: time bucket for TTL, changes every COLUMN_VISIBILITY_TTL_MS
 */
export function buildColumnVisibilityStorageKey(
  params: ColumnVisibilityKeyParams,
): string {
  const { tableId, tenantSlug, userId, allowedAttributes } = params;

  const safeTable = tableId || 'unknown-table';
  const safeTenant = tenantSlug || 'no-tenant';
  const safeUser = userId != null ? String(userId) : 'anonymous';

  // Permissions signature
  const attrsKey =
    !allowedAttributes || allowedAttributes.length === 0
      ? 'all'
      : allowedAttributes.slice().sort().join('_');

  // Time bucket for TTL: changes every COLUMN_VISIBILITY_TTL_MS
  const bucket = Math.floor(Date.now() / COLUMN_VISIBILITY_TTL_MS);

  return [
    'mobix-columns', // prefix for easier cleanup/debugging
    safeTable,
    `t=${safeTenant}`,
    `u=${safeUser}`,
    `a=${attrsKey}`,
    `b=${bucket}`,
  ].join(':');
}
