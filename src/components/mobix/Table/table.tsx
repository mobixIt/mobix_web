'use client';

import * as React from 'react';
import type { Key } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  IconButton,
  Typography,
  Collapse,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  SaveAlt,
  Delete,
  ViewColumn,
} from '@mui/icons-material';

import {
  Root,
  TablePaper,
  ToolbarRoot,
  ToolbarActions,
  TableName,
  ToolbarContent,
  StyledCheckbox,
  TableTopProgress,
} from './styles';

import type { MobixTableProps } from './types';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from './constants';
import {
  formatSelectedItems,
  isDownloadConfigured,
  isDeleteConfigured,
} from './helpers';
import { MobixConfirmDialog } from '@/components/mobix/confirm-dialog';
import type { DownloadFormat } from './types';
import Icon from '@mdi/react';
import { mdiFilePdfBox, mdiFileExcel } from '@mdi/js';

type SortDirection = 'asc' | 'desc';

interface SortState {
  field: string;
  direction: SortDirection;
}

export function MobixTable<T extends { id: Key }>(
  props: MobixTableProps<T>,
) {
  const {
    title,
    itemNameSingular,
    itemNamePlural,
    rows,
    columns,
    loading = false,
    enableSelection = true,
    onSelectionChange,
    initialPageSize = DEFAULT_PAGE_SIZE,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    renderToolbarActions,
    renderBatchActions,
    renderRowDetails,
    enablePagination = true,
    paginationMode = 'client',
    page: controlledPage,
    rowsPerPage: controlledRowsPerPage,
    totalCount: controlledTotalCount,
    onPageChange: onExternalPageChange,
    onRowsPerPageChange: onExternalRowsPerPageChange,
    enableColumnVisibility = true,
    columnVisibilityStorageKey,
    initialVisibleColumnIds,
    onVisibleColumnsChange,
    onSaveColumnVisibility,
    onRowClick,
    RowDetailsComponent,
    sortMode = 'none',
    initialSort,
    sort: controlledSort,
    onSortChange,
    emptyStateContent,
  } = props;

  const isServerPagination = paginationMode === 'server';
  const isClientSorting = sortMode === 'client';
  const isServerSorting = sortMode === 'server';

  /* ---------------------------------------------------------------------- */
  /*                               SORT STATE                               */
  /* ---------------------------------------------------------------------- */

  const [internalSort, setInternalSort] =
    React.useState<SortState | null>(() => initialSort ?? null);

  const effectiveSort: SortState | null = React.useMemo(() => {
    if (isServerSorting) {
      return controlledSort ?? null;
    }
    return internalSort;
  }, [controlledSort, internalSort, isServerSorting]);

  const handleRequestSort = (columnId: string) => {
    if (sortMode === 'none') return;

    const isSameField = effectiveSort?.field === columnId;
    let nextSort: SortState | null;

    if (!isSameField) {
      nextSort = { field: columnId, direction: 'asc' };
    } else if (effectiveSort?.direction === 'asc') {
      nextSort = { field: columnId, direction: 'desc' };
    } else {
      // ciclo: asc -> desc -> sin orden
      nextSort = null;
    }

    if (isClientSorting) {
      setInternalSort(nextSort);
    }

    if (onSortChange) {
      onSortChange(nextSort);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                         PAGINATION & SELECTION                         */
  /* ---------------------------------------------------------------------- */

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] =
    React.useState(initialPageSize);
  const [selectedIds, setSelectedIds] = React.useState<Key[]>([]);
  const [openRowId, setOpenRowId] =
    React.useState<Key | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] =
    React.useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [columnsMenuAnchorEl, setColumnsMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isDownloadMenuOpen = Boolean(downloadAnchorEl);
  const isColumnsMenuOpen = Boolean(columnsMenuAnchorEl);

  /* ---------------------------------------------------------------------- */
  /*                          COLUMN VISIBILITY STATE                        */
  /* ---------------------------------------------------------------------- */

  const [visibleColumnIds, setVisibleColumnIds] =
    React.useState<string[]>(() => {
      const allIds = columns.map((c) => String(c.id));

      if (!enableColumnVisibility) {
        return allIds;
      }

      if (
        columnVisibilityStorageKey &&
        typeof window !== 'undefined'
      ) {
        try {
          const stored = window.localStorage.getItem(
            `mobix-table-columns:${columnVisibilityStorageKey}`,
          );
          if (stored) {
            const parsed = JSON.parse(stored) as string[];
            const normalized = parsed.filter((id) =>
              allIds.includes(id),
            );
            if (normalized.length > 0) return normalized;
          }
        } catch {
          // ignore
        }
      }

      if (
        initialVisibleColumnIds &&
        initialVisibleColumnIds.length > 0
      ) {
        const normalized =
          initialVisibleColumnIds.filter((id) =>
            allIds.includes(id),
          );
        if (normalized.length > 0) return normalized;
      }

      return allIds;
    });

  React.useEffect(() => {
    setVisibleColumnIds((prev) => {
      const currentIds = columns.map((c) => String(c.id));
      const next = prev.filter((id) =>
        currentIds.includes(id),
      );
      if (next.length === 0) return currentIds;
      return next;
    });
  }, [columns]);

  React.useEffect(() => {
    const allColumnIds = columns.map((c) => String(c.id));
    const normalized = visibleColumnIds.filter((id) =>
      allColumnIds.includes(id),
    );

    if (
      enableColumnVisibility &&
      columnVisibilityStorageKey &&
      typeof window !== 'undefined'
    ) {
      try {
        window.localStorage.setItem(
          `mobix-table-columns:${columnVisibilityStorageKey}`,
          JSON.stringify(normalized),
        );
      } catch {
        // ignore
      }
    }

    if (onVisibleColumnsChange) {
      onVisibleColumnsChange(normalized);
    }
  }, [
    visibleColumnIds,
    columns,
    enableColumnVisibility,
    columnVisibilityStorageKey,
    onVisibleColumnsChange,
  ]);

  const visibleColumns = React.useMemo(
    () =>
      enableColumnVisibility
        ? columns.filter((col) =>
            visibleColumnIds.includes(String(col.id)),
          )
        : columns,
    [columns, visibleColumnIds, enableColumnVisibility],
  );

  /* ---------------------------------------------------------------------- */
  /*                     SORTED ROWS (CLIENT-SIDE SORTING)                   */
  /* ---------------------------------------------------------------------- */

  function getValue<T, K extends keyof T>(row: T, key: K): T[K] {
    return row[key];
  }

  const sortedRows = React.useMemo(() => {
  if (!isClientSorting || !effectiveSort) return rows;

  const { field, direction } = effectiveSort;

  const column = columns.find((c) => String(c.id) === field);

  const fieldKey = (column?.field ?? field) as keyof T;

  const factor = direction === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const av = getValue(a, fieldKey);
    const bv = getValue(b, fieldKey);

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}, [rows, columns, effectiveSort, isClientSorting]);

  const sourceRows = isClientSorting ? sortedRows : rows;

  /* ---------------------------------------------------------------------- */
  /*                           PAGINATION CALCULATED                         */
  /* ---------------------------------------------------------------------- */

  const currentPage = isServerPagination
    ? controlledPage ?? 0
    : page;

  const currentRowsPerPage = isServerPagination
    ? controlledRowsPerPage ?? rowsPerPage
    : enablePagination
    ? rowsPerPage
    : sourceRows.length || 0;

  const effectiveTotalCount = isServerPagination
    ? controlledTotalCount ?? sourceRows.length
    : sourceRows.length;

  const paginatedRows = React.useMemo(
    () =>
      enablePagination && !isServerPagination
        ? sourceRows.slice(
            currentPage * currentRowsPerPage,
            currentPage * currentRowsPerPage +
              currentRowsPerPage,
          )
        : sourceRows,
    [
      sourceRows,
      currentPage,
      currentRowsPerPage,
      enablePagination,
      isServerPagination,
    ],
  );

  const keepPreviousData = props.keepPreviousData ?? false;
  const isRefreshing = Boolean(loading && keepPreviousData && rows.length > 0);
  const shouldShowLoadingRow = Boolean(loading && !isRefreshing);
  const interactionDisabled = isRefreshing;

  /* ---------------------------------------------------------------------- */
  /*                          SELECTION & HANDLERS                           */
  /* ---------------------------------------------------------------------- */

  const selectedRowSet = React.useMemo(
    () => new Set(selectedIds),
    [selectedIds],
  );

  const handleSelectAllOnPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!enableSelection) return;

    if (event.target.checked) {
      const newIds = [
        ...new Set([
          ...selectedIds,
          ...paginatedRows.map((r) => r.id),
        ]),
      ];
      setSelectedIds(newIds);
      if (onSelectionChange) {
        const selectedRows = rows.filter((row) =>
          newIds.includes(row.id),
        );
        onSelectionChange(newIds, selectedRows);
      }
    } else {
      const idsOnPage = new Set(
        paginatedRows.map((r) => r.id),
      );
      const remaining = selectedIds.filter(
        (id) => !idsOnPage.has(id),
      );
      setSelectedIds(remaining);
      if (onSelectionChange) {
        const selectedRows = rows.filter((row) =>
          remaining.includes(row.id),
        );
        onSelectionChange(remaining, selectedRows);
      }
    }
  };

  const handleToggleRow = (id: Key) => {
    if (!enableSelection) return;

    const isSelected = selectedRowSet.has(id);
    const newIds = isSelected
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];

    setSelectedIds(newIds);

    if (onSelectionChange) {
      const selectedRows = rows.filter((row) =>
        newIds.includes(row.id),
      );
      onSelectionChange(newIds, selectedRows);
    }
  };

  const isAllPageSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((row) =>
      selectedRowSet.has(row.id),
    );

  const hasSelection = selectedIds.length > 0;

  const handleToggleExpand = (id: Key) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };

  const handleChangePage = (
    _event: unknown,
    newPage: number,
  ) => {
    if (interactionDisabled) return;
    if (!enablePagination) return;

    if (isServerPagination) {
      if (onExternalPageChange) {
        onExternalPageChange(newPage);
      }
      return;
    }

    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (interactionDisabled) return;
    const value = parseInt(event.target.value, 10);

    if (isServerPagination) {
      if (onExternalRowsPerPageChange) {
        onExternalRowsPerPageChange(value);
      }
      return;
    }

    setRowsPerPage(value);
    setPage(0);
  };

  /* ---------------------------------------------------------------------- */
  /*                       DOWNLOAD & DELETE LOGIC                            */
  /* ---------------------------------------------------------------------- */

  const isDownloadEnabled = isDownloadConfigured(props);
  const isDeleteEnabled = isDeleteConfigured(props);

  const resolvedDownloadFormats: DownloadFormat[] =
    React.useMemo(() => {
      if (!isDownloadEnabled) return [];
      if (
        props.downloadFormats &&
        props.downloadFormats.length > 0
      ) {
        return props.downloadFormats;
      }
      return ['xls', 'pdf'];
    }, [isDownloadEnabled, props.downloadFormats]);

  const baseSingular =
    itemNameSingular ||
    (title
      ? title.toLowerCase().trim().replace(/s$/, '')
      : 'registro');

  const basePlural =
    itemNamePlural ||
    (title ? title.toLowerCase().trim() : 'registros');

  const confirmLabel =
    selectedIds.length === 1
      ? `este ${baseSingular}`
      : `${selectedIds.length} ${basePlural}`;

  const formatDownloadLabel = (
    format: DownloadFormat,
  ): string => {
    switch (format) {
      case 'xls':
        return 'Excel';
      case 'pdf':
        return 'PDF';
      default:
        const _exhaustive: never = format;
        return _exhaustive;
    }
  };

  const handleDownloadClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (
      !isDownloadEnabled ||
      resolvedDownloadFormats.length === 0
    )
      return;

    if (resolvedDownloadFormats.length === 1) {
      props.onDownloadClick(resolvedDownloadFormats[0]);
      return;
    }

    setDownloadAnchorEl(event.currentTarget);
  };

  const handleSelectDownloadFormat = (
    format: DownloadFormat,
  ) => {
    if (!isDownloadEnabled) return;
    props.onDownloadClick(format);
    setDownloadAnchorEl(null);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const handleOpenDeleteDialog = () =>
    setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () =>
    setDeleteDialogOpen(false);

  const handleConfirmDelete = () => {
    if (isDeleteEnabled && selectedIds.length > 0) {
      const selectedRows = rows.filter((row) =>
        selectedIds.includes(row.id),
      );
      props.onDeleteClick(selectedIds, selectedRows);
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([], []);
    }
    setDeleteDialogOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /*                        COLUMN VISIBILITY HANDLERS                        */
  /* ---------------------------------------------------------------------- */

  const handleOpenColumnsMenu = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (!enableColumnVisibility) return;
    setColumnsMenuAnchorEl(event.currentTarget);
  };

  const handleCloseColumnsMenu = () => {
    setColumnsMenuAnchorEl(null);
  };

  const handleToggleColumnVisibility = (columnId: string) => {
    setVisibleColumnIds((prev) => {
      const exists = prev.includes(columnId);

      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== columnId);
      }

      return [...prev, columnId];
    });
  };

  const handleShowAllColumns = () => {
    const allIds = columns.map((c) => String(c.id));
    setVisibleColumnIds(allIds);
  };

  const handleResetColumns = () => {
    const allIds = columns.map((c) => String(c.id));

    if (
      initialVisibleColumnIds &&
      initialVisibleColumnIds.length > 0
    ) {
      const normalized =
        initialVisibleColumnIds.filter((id) =>
          allIds.includes(id),
        );
      setVisibleColumnIds(
        normalized.length > 0 ? normalized : allIds,
      );
    } else {
      setVisibleColumnIds(allIds);
    }
  };

  const handleSaveColumnsSelection = () => {
    if (onSaveColumnVisibility) {
      onSaveColumnVisibility(visibleColumnIds);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                           ROW DETAILS HELPERS                           */
  /* ---------------------------------------------------------------------- */

  const hasRowDetails = !!renderRowDetails || !!RowDetailsComponent;

  const renderRowDetailsContent = (row: T) => {
    if (renderRowDetails) return renderRowDetails(row);
    if (RowDetailsComponent) {
      return <RowDetailsComponent row={row} />;
    }
    return null;
  };

  /* ---------------------------------------------------------------------- */
  /*                                   RENDER                                */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <Root>
        <ToolbarRoot hasSelection={hasSelection}>
          <ToolbarContent>
            <TableName variant="h1">
              {hasSelection
                ? formatSelectedItems(selectedIds.length)
                : title}
            </TableName>

            <ToolbarActions>
              {!hasSelection && renderToolbarActions}

              {isDownloadEnabled && !hasSelection && (
                <>
                  <Tooltip title="Descargar registros">
                    <IconButton
                      aria-label="Download"
                      onClick={handleDownloadClick}
                     color="info"
                    >
                      <SaveAlt />
                    </IconButton>
                  </Tooltip>

                  <Menu
                    id="mobix-download-menu"
                    anchorEl={downloadAnchorEl}
                    open={
                      isDownloadMenuOpen &&
                      resolvedDownloadFormats.length > 1
                    }
                    onClose={handleCloseDownloadMenu}
                  >
                    {resolvedDownloadFormats.map((format) => (
                      <MenuItem
                        key={format}
                        onClick={() =>
                          handleSelectDownloadFormat(format)
                        }
                      >
                        {format === 'pdf' && (
                          <Icon
                            path={mdiFilePdfBox}
                            size={0.9}
                            style={{ marginRight: 8 }}
                          />
                        )}

                        {format === 'xls' && (
                          <Icon
                            path={mdiFileExcel}
                            size={0.9}
                            style={{ marginRight: 8 }}
                          />
                        )}

                        {formatDownloadLabel(format)}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {isDeleteEnabled && hasSelection && (
                <Tooltip title="Eliminar registros seleccionados">
                  <IconButton
                    aria-label="Delete"
                    onClick={handleOpenDeleteDialog}
                   color="info"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}

              {enableColumnVisibility && !hasSelection && (
                <>
                  <Tooltip title="Mostrar selector de columnas">
                    <IconButton
                      aria-label="Mostrar selector de columnas"
                      onClick={handleOpenColumnsMenu}
                     color="info"
                    >
                      <ViewColumn />
                    </IconButton>
                  </Tooltip>

                  <Menu
                    id="mobix-columns-menu"
                    anchorEl={columnsMenuAnchorEl}
                    open={isColumnsMenuOpen}
                    onClose={handleCloseColumnsMenu}
                  >
                    {columns.map((col) => {
                      const colId = String(col.id);
                      const checked =
                        visibleColumnIds.includes(colId);
                      const hideable =
                        col.hideable !== false;

                      return (
                        <MenuItem
                          key={col.id}
                          dense
                          disabled={!hideable}
                          onClick={() =>
                            hideable &&
                            handleToggleColumnVisibility(colId)
                          }
                        >
                          <StyledCheckbox
                            checked={checked}
                            disabled={!hideable}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2">
                            {col.label}
                          </Typography>
                        </MenuItem>
                      );
                    })}

                    <Divider />

                    {onSaveColumnVisibility && (
                      <MenuItem
                        dense
                        onClick={handleSaveColumnsSelection}
                      >
                        <Typography variant="body2">
                          Guardar selección
                        </Typography>
                      </MenuItem>
                    )}

                    <MenuItem dense onClick={handleShowAllColumns}>
                      <Typography variant="body2">
                        Mostrar todas
                      </Typography>
                    </MenuItem>

                    <MenuItem dense onClick={handleResetColumns}>
                      <Typography variant="body2">
                        Restablecer
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </ToolbarActions>
          </ToolbarContent>

          {renderBatchActions && hasSelection && (
            <Box sx={{ px: 2, pb: 1 }}>
              {renderBatchActions(
                selectedIds,
                rows.filter((r) =>
                  selectedIds.includes(r.id),
                ),
              )}
            </Box>
          )}
        </ToolbarRoot>

        <TablePaper>
          {isRefreshing && <TableTopProgress color="secondary" />}
          <TableContainer
            sx={{
              opacity: isRefreshing ? 0.2 : 1,
              pointerEvents: isRefreshing ? 'none' : 'auto',
              transition: (theme) =>
                theme.transitions.create(['opacity'], { duration: 200 }),
            }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow>
                  {enableSelection && (
                    <TableCell padding="checkbox">
                      <StyledCheckbox
                        indeterminate={
                          hasSelection && !isAllPageSelected
                        }
                        checked={
                          paginatedRows.length > 0 &&
                          isAllPageSelected
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        onChange={handleSelectAllOnPage}
                      />
                    </TableCell>
                  )}

                  {hasRowDetails && (
                    <TableCell padding="checkbox" />
                  )}

                  {visibleColumns.map((col) => {
                    const colId = String(col.id);
                    const isSorted =
                      !!effectiveSort &&
                      effectiveSort.field === colId;
                    const sortable =
                      col.sortable !== false &&
                      sortMode !== 'none';

                    return (
                      <TableCell
                        key={col.id}
                        align={col.align ?? 'left'}
                        sx={{ minWidth: col.minWidth }}
                        sortDirection={
                          isSorted
                            ? effectiveSort?.direction
                            : false
                        }
                      >
                        {sortable ? (
                          <TableSortLabel
                            active={isSorted}
                            direction={
                              effectiveSort?.direction || 'asc'
                            }
                            onClick={() =>
                              handleRequestSort(colId)
                            }
                          >
                            {col.label}
                          </TableSortLabel>
                        ) : (
                          col.label
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {shouldShowLoadingRow && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        visibleColumns.length +
                        (enableSelection ? 1 : 0) +
                        (hasRowDetails ? 1 : 0)
                      }
                    >
                      <Typography variant="body2">Loading…</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!shouldShowLoadingRow && paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        visibleColumns.length +
                        (enableSelection ? 1 : 0) +
                        (hasRowDetails ? 1 : 0)
                      }
                    >
                      {emptyStateContent ?? <Typography variant="body2">No data</Typography>}
                    </TableCell>
                  </TableRow>
                )}

                {!shouldShowLoadingRow &&
                  paginatedRows.map((row) => {
                    const open = openRowId === row.id;
                    const isSelected = selectedRowSet.has(row.id);

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          hover
                          onClick={onRowClick ? () => onRowClick(row) : undefined}
                          sx={{
                            cursor: onRowClick ? 'pointer' : 'default',
                          }}
                        >
                          {enableSelection && (
                            <TableCell padding="checkbox">
                              <StyledCheckbox
                                checked={isSelected}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => handleToggleRow(row.id)}
                              />
                            </TableCell>
                          )}

                          {hasRowDetails && (
                            <TableCell padding="checkbox">
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleToggleExpand(row.id);
                                }}
                              >
                                {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                              </IconButton>
                            </TableCell>
                          )}

                          {visibleColumns.map((col) => (
                            <TableCell key={col.id} align={col.align ?? 'left'}>
                              {col.render
                                ? col.render(row)
                                : col.field
                                  ? (row[col.field] as React.ReactNode)
                                  : null}
                            </TableCell>
                          ))}
                        </TableRow>

                        {hasRowDetails && (
                          <TableRow>
                            <TableCell
                              style={{
                                paddingBottom: 0,
                                paddingTop: 0,
                              }}
                              colSpan={visibleColumns.length + (enableSelection ? 1 : 0) + 1}
                            >
                              <Collapse in={open} timeout="auto" unmountOnExit>
                                <Box sx={{ m: 2 }}>
                                  <Divider sx={{ mb: 2 }} />
                                  {renderRowDetailsContent(row)}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          {enablePagination && (
            <TablePagination
              component="div"
              count={effectiveTotalCount}
              page={currentPage}
              onPageChange={handleChangePage}
              rowsPerPage={currentRowsPerPage}
              onRowsPerPageChange={
                handleChangeRowsPerPage
              }
              rowsPerPageOptions={pageSizeOptions}
            />
          )}
        </TablePaper>
      </Root>

      <MobixConfirmDialog
        open={isDeleteDialogOpen}
        title="Eliminar elementos"
        onClose={handleCloseDeleteDialog}
        primaryActionLabel="Eliminar"
        onPrimaryAction={handleConfirmDelete}
        secondaryActionLabel="Cancelar"
        onSecondaryAction={handleCloseDeleteDialog}
      >
        <Typography variant="body2">
          ¿Seguro que deseas eliminar{' '}
          <strong>{confirmLabel}</strong>? Esta acción no
          se puede deshacer.
        </Typography>
      </MobixConfirmDialog>
    </>
  );
}
