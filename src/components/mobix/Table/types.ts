import type { Key, ReactNode, ComponentType } from 'react';

export type DownloadFormat = 'xls' | 'pdf';

/* -------------------------------------------------------------------------- */
/*                                 SORTING                                     */
/* -------------------------------------------------------------------------- */

/**
 * Allowed sort directions for the table.
 */
export type MobixTableSortDirection = 'asc' | 'desc';

/**
 * Sorting state used by the table.
 */
export interface MobixTableSortState {
  /**
   * Column identifier used for sorting. By default we use the column `id`.
   */
  field: string;
  /**
   * Sort direction: "asc" or "desc".
   */
  direction: MobixTableSortDirection;
}

/* -------------------------------------------------------------------------- */
/*                             COLUMN DEFINITION                               */
/* -------------------------------------------------------------------------- */

export interface MobixTableColumn<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
  field?: keyof T;

  /**
   * Indicates if the column can be hidden from the column selector.
   * Default is true. If false, the column is always visible and appears
   * disabled in the column chooser menu.
   */
  hideable?: boolean;

  /**
   * Indicates if the column is sortable.
   * - If false, the column header won't show sorting UI.
   * - If omitted and sortMode !== "none", it is considered sortable.
   */
  sortable?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                        BASE PROPS (INDEPENDENT OF MODES)                   */
/* -------------------------------------------------------------------------- */

export interface MobixTableBaseProps<T extends { id: Key }> {
  title?: string;

  itemNameSingular?: string;
  itemNamePlural?: string;

  rows: T[];
  columns: MobixTableColumn<T>[];

  /**
   * When true, a loading row is displayed and data is not rendered.
   */
  loading?: boolean;

  /**
   * Enables row selection with checkboxes.
   * Default: true.
   */
  enableSelection?: boolean;

  /**
   * Called whenever the selection changes.
   * Provides the selected ids and full row objects.
   */
  onSelectionChange?: (selectedIds: Key[], selectedRows: T[]) => void;

  /**
   * Initial page size for client-side pagination.
   * Ignored in server mode if rowsPerPage is controlled.
   */
  initialPageSize?: number;

  /**
   * Available page size options shown in the pagination component.
   */
  pageSizeOptions?: number[];

  /**
   * Custom React node rendered on the right side of the toolbar
   * when there is no active selection.
   */
  renderToolbarActions?: ReactNode;

  /**
   * Custom actions rendered below the toolbar when one or more
   * rows are selected. Receives selected ids and full row objects.
   */
  renderBatchActions?: (selectedIds: Key[], selectedRows: T[]) => ReactNode;

  /**
   * Inline render function used to show row details when a row is expanded.
   * Only used when RowDetailsComponent is not provided.
   */
  renderRowDetails?: (row: T) => ReactNode;

  /**
   * Component used to render row details when a row is expanded.
   * Receives a single prop: { row }.
   * This is useful for more complex layouts or styled detail cards.
   */
  RowDetailsComponent?: ComponentType<{ row: T }>;

  /**
   * Called when the user clicks on a row (anywhere in the row).
   * Useful to navigate to a detail page.
   */
  onRowClick?: (row: T) => void;

  /** Enable/disable pagination UI. Default: true. */
  enablePagination?: boolean;

  /* ---------------------------------------------------------------------- */
  /*                      PAGINATION MODE (CLIENT / SERVER)                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Controls how pagination is handled:
   * - "client": all rows are in memory and pagination is done locally.
   * - "server": pagination is controlled externally; the component
   *   only renders the current page and calls callbacks.
   *
   * Default: "client".
   */
  paginationMode?: 'client' | 'server';

  /**
   * In "server" mode: current page index (0-based).
   * In "client" mode this prop is ignored.
   */
  page?: number;

  /**
   * In "server" mode: number of rows per page.
   * In "client" mode this prop is ignored.
   */
  rowsPerPage?: number;

  /**
   * In "server" mode: total number of rows available in the backend.
   * Required to correctly display the pagination component.
   */
  totalCount?: number;

  /**
   * In "server" mode: called when a new page is requested from the UI.
   */
  onPageChange?: (page: number) => void;

  /**
   * In "server" mode: called when rows per page is changed from the UI.
   */
  onRowsPerPageChange?: (rowsPerPage: number) => void;

  /* ---------------------------------------------------------------------- */
  /*                         COLUMN VISIBILITY                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Enables the column visibility selector and related logic.
   * Default: true.
   */
  enableColumnVisibility?: boolean;

  /**
   * Storage key used to persist visible column ids into localStorage.
   * The final key is: `mobix-table-columns:${columnVisibilityStorageKey}`.
   * Ideally unique per screen/table.
   */
  columnVisibilityStorageKey?: string;

  /**
   * Initial list of visible column ids (matching MobixTableColumn.id).
   * If omitted and there is no localStorage value, all columns are shown.
   */
  initialVisibleColumnIds?: string[];

  /**
   * Called every time the visible columns change.
   * Useful for persisting preferences on the backend.
   */
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;

  /**
   * When provided, a "Save selection" action is shown in the column
   * chooser menu and this callback is executed.
   */
  onSaveColumnVisibility?: (visibleColumnIds: string[]) => void;

  /* ---------------------------------------------------------------------- */
  /*                                SORTING                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Controls how sorting is handled:
   * - "none": sorting UI is disabled.
   * - "client": sorting is applied internally on the full `rows` array.
   * - "server": sorting is controlled externally; the component only
   *   notifies changes via onSortChange.
   *
   * Default: "none".
   */
  sortMode?: 'none' | 'client' | 'server';

  /**
   * Initial sort state for client-side sorting (uncontrolled).
   * Ignored when sortMode is "server".
   */
  initialSort?: MobixTableSortState;

  /**
   * Controlled sort state, mainly for server-side sorting.
   * When provided in "server" mode, the component will use this value
   * to show the current sort indicators.
   */
  sort?: MobixTableSortState | null;

  /**
   * Called whenever the user changes the sorting (by clicking a sortable
   * column header). Fired in both "client" and "server" modes.
   * Passing null means "no sorting".
   */
  onSortChange?: (sort: MobixTableSortState | null) => void;

  /* ---------------------------------------------------------------------- */
  /*                              EMPTY STATE                               */
  /* ---------------------------------------------------------------------- */

  /**
   * Optional custom content to render when there are no rows to display
   * and the table is not in loading state.
   * If not provided, a default "No data" message is shown.
   */
  emptyStateContent?: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                       DOWNLOAD DISCRIMINATED UNION                          */
/* -------------------------------------------------------------------------- */

export interface MobixTableDownloadDisabledProps {
  /**
   * When false or undefined, the download button is not rendered
   * and download-related props are not allowed.
   */
  enableDownload?: false;
  onDownloadClick?: never;
  downloadFormats?: never;
}

export interface MobixTableDownloadEnabledProps {
  /**
   * When true, the download button is rendered and clicking it will
   * trigger `onDownloadClick`.
   */
  enableDownload: true;

  /**
   * Called when the user selects a download format.
   */
  onDownloadClick: (format: DownloadFormat) => void;

  /**
   * Supported download formats. If omitted, ['xls', 'pdf'] is used.
   */
  downloadFormats?: DownloadFormat[];
}

/* -------------------------------------------------------------------------- */
/*                         DELETE DISCRIMINATED UNION                          */
/* -------------------------------------------------------------------------- */

export interface MobixTableDeleteDisabledProps<T extends { id: Key }> {
  /**
   * When false or undefined, the delete button and confirm dialog
   * are not rendered.
   */
  enableDelete?: false;
  onDeleteClick?: never;
}

export interface MobixTableDeleteEnabledProps<T extends { id: Key }> {
  /**
   * When true, a delete button is shown when there is selection and
   * a confirmation dialog is displayed before calling onDeleteClick.
   */
  enableDelete: true;

  /**
   * Called after the user confirms deletion.
   * Provides selected ids and full row objects.
   */
  onDeleteClick: (selectedIds: Key[], selectedRows: T[]) => void;
}

/* -------------------------------------------------------------------------- */
/*                                FINAL TYPE                                   */
/* -------------------------------------------------------------------------- */

export type MobixTableProps<T extends { id: Key }> =
  MobixTableBaseProps<T> &
    (MobixTableDownloadDisabledProps | MobixTableDownloadEnabledProps) &
    (MobixTableDeleteDisabledProps<T> | MobixTableDeleteEnabledProps<T>);
