'use client';

import { useAppSelector } from '@/store/hooks';
import { selectHasPermission } from '@/store/slices/permissionsSlice';

/**
 * UI-friendly permission hook.
 * Returns false while permissions are not ready (prevents UI flicker).
 */
export function useHasPermission(permission: string): boolean {
  return useAppSelector(selectHasPermission(permission));
}
