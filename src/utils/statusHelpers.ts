export type RawStatus = string | number | boolean | null | undefined;

/**
 * Normalized status values used internally by the UI.
 */
export type NormalizedStatus = 'active' | 'inactive';

/**
 * Human-readable Spanish labels for status values.
 */
export type StatusLabel = 'Activo' | 'Inactivo';

/**
 * Normalizes any raw status value into a clean, lowercase string.
 *
 * This function:
 * - Trims whitespace
 * - Converts numbers to strings
 * - Converts booleans to `"true"` / `"false"`
 * - Returns an empty string for null or undefined values
 *
 * @param value - Any raw status value coming from the API or database
 * @returns A normalized lowercase string representation of the status
 */
function normalizeStatus(value: RawStatus): string {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return '';
}

/**
 * Determines whether the given value represents an "active" status.
 *
 * Accepted active values:
 * - true
 * - 1
 * - "1"
 * - "true"
 * - "active"
 * - "activo"
 *
 * @param status - Raw status value
 * @returns `true` if the status represents an active state
 */
export function isActiveStatus(status: RawStatus): boolean {
  const normalized = normalizeStatus(status);

  return (
    normalized === '1' ||
    normalized === 'true' ||
    normalized === 'active' ||
    normalized === 'activo'
  );
}

/**
 * Determines whether the given value represents an "inactive" status.
 *
 * Accepted inactive values:
 * - false
 * - 0
 * - "0"
 * - "false"
 * - "inactive"
 * - "inactivo"
 *
 * @param status - Raw status value
 * @returns `true` if the status represents an inactive state
 */
export function isInactiveStatus(status: RawStatus): boolean {
  const normalized = normalizeStatus(status);

  return (
    normalized === '0' ||
    normalized === 'false' ||
    normalized === 'inactive' ||
    normalized === 'inactivo'
  );
}

/**
 * Maps any raw status value to a human-friendly Spanish label.
 *
 * - Active values → `"Activo"`
 * - Inactive values → `"Inactivo"`
 * - Unknown values → `"Inactivo"` (default fallback)
 *
 * @param status - Raw status value
 * @returns A Spanish status label (`"Activo"` or `"Inactivo"`)
 */
export function mapStatusToLabel(status: RawStatus): StatusLabel {
  if (isActiveStatus(status)) return 'Activo';
  if (isInactiveStatus(status)) return 'Inactivo';

  // Default fallback
  return 'Inactivo';
}

/**
 * Maps any raw status value to a normalized internal variant.
 *
 * This is typically used to drive UI components such as:
 * - Status pills
 * - Status badges
 * - Conditional row styling
 *
 * - Active values → `"active"`
 * - Inactive values → `"inactive"`
 *
 * @param status - Raw status value
 * @returns A normalized status variant (`"active"` or `"inactive"`)
 */
export function mapStatusToVariant(status: RawStatus): NormalizedStatus {
  return isActiveStatus(status) ? 'active' : 'inactive';
}
