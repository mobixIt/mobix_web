import type {
  MobixTableProps,
  MobixTableBaseProps,
  MobixTableDownloadEnabledProps,
  MobixTableDeleteEnabledProps,
} from './types';
import type { Key } from 'react';

/**
 * Formats a label based on how many items are selected.
 *
 * Examples:
 *   formatSelectedItems(0) -> ""
 *   formatSelectedItems(1) -> "1 item seleccionado"
 *   formatSelectedItems(5) -> "5 items seleccionados"
 */
export function formatSelectedItems(count: number): string {
  if (count <= 0) return '';
  return `${count} ${
    count === 1 ? 'item seleccionado' : 'items seleccionados'
  }`;
}

/**
 * Determines whether the table's download feature is fully configured.
 *
 * This checks two conditions:
 * - `enableDownload` is explicitly set to `true`
 * - `onDownloadClick` exists and is a valid function
 *
 * Use this helper when rendering the toolbar or download menu, to ensure
 * that the component only exposes the download controls when all required
 * props are correctly provided.
 *
 * @param props - The complete set of props passed to the MobixTable component.
 *
 * @returns `true` if download mode is enabled and properly configured;
 *          otherwise `false`.
 */
export function isDownloadConfigured<T extends { id: Key }>(
  props: MobixTableProps<T>,
): props is MobixTableBaseProps<T> & MobixTableDownloadEnabledProps {
  return (
    props.enableDownload === true &&
    typeof (props as MobixTableDownloadEnabledProps).onDownloadClick ===
      'function'
  );
}

/**
 * Determines whether the table's delete feature is fully configured.
 *
 * This checks two conditions:
 * - `enableDelete` is explicitly set to `true`
 * - `onDeleteClick` exists and is a valid function
 *
 * Use this helper when rendering the toolbar or delete button, to ensure
 * that the component only exposes delete controls when all required
 * props are correctly provided.
 *
 * @param props - The complete set of props passed to the MobixTable component.
 *
 * @returns `true` if delete mode is enabled and properly configured;
 *          otherwise `false`.
 */
export function isDeleteConfigured<T extends { id: Key }>(
  props: MobixTableProps<T>,
): props is MobixTableBaseProps<T> & MobixTableDeleteEnabledProps<T> {
  return (
    props.enableDelete === true &&
    typeof (props as MobixTableDeleteEnabledProps<T>).onDeleteClick ===
      'function'
  );
}
