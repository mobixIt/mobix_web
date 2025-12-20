import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import { MobixTable } from '@/components/mobix/table';
import type { MobixTableColumn, MobixTableProps } from '@/components/mobix/table';

interface UserRow {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
}

const baseRows: UserRow[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', status: 'active', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', status: 'inactive', role: 'Viewer' },
  { id: 3, name: 'Carlos Gómez', email: 'carlos@example.com', status: 'active', role: 'Manager' },
];

const baseColumns: MobixTableColumn<UserRow>[] = [
  { id: 'name', label: 'Nombre', field: 'name' },
  { id: 'email', label: 'Email', field: 'email' },
  { id: 'status', label: 'Estado', field: 'status' },
  { id: 'role', label: 'Rol', field: 'role' },
];

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

function renderUserTable(
  overrides: Partial<Omit<
    MobixTableProps<UserRow>,
    'enableDownload' | 'enableDelete' | 'onDownloadClick' | 'onDeleteClick' | 'downloadFormats'
  >> &
    (
      | {
          enableDownload: true;
          onDownloadClick: (format: 'xls' | 'pdf') => void;
          downloadFormats?: Array<'xls' | 'pdf'>;
        }
      | {
          enableDownload?: false | undefined;
          onDownloadClick?: undefined;
          downloadFormats?: undefined;
        }
    ) &
    (
      | {
          enableDelete: true;
          onDeleteClick: (selectedIds: React.Key[], selectedRows: UserRow[]) => void;
        }
      | {
          enableDelete?: false | undefined;
          onDeleteClick?: undefined;
        }
    ) = {},
) {
  const props: MobixTableProps<UserRow> = {
    title: 'Usuarios',
    itemNameSingular: 'usuario',
    itemNamePlural: 'usuarios',
    rows: baseRows,
    columns: baseColumns,
    enableSelection: false,
    enablePagination: true,
    paginationMode: 'client',
    ...overrides,
  };

  return renderWithTheme(<MobixTable<UserRow> {...props} />);
}

function getBodyRowTextsByColumnHeader(headerLabel: string) {
  // 1. Find the column index based on the header text
  // We search within the first row containing headers (usually within thead)
  const allHeaders = screen.getAllByRole('columnheader');
  const headerIndex = allHeaders.findIndex(
    (cell) => cell.textContent?.trim() === headerLabel
  );

  if (headerIndex < 0) throw new Error(`Header "${headerLabel}" not found`);

  // 2. Get only body rows (tbody)
  // rowgroup usually defines thead and tbody. We look for rows that are NOT in the header.
  // A robust way is to find all rows and filter out those that have header cells (role="columnheader").
  const allRows = screen.getAllByRole('row');
  const bodyRows = allRows.filter(
    (row) => within(row).queryAllByRole('columnheader').length === 0
  );

  return bodyRows
    .map((row) => {
      const cells = within(row).getAllByRole('cell');
      // Ensure the cell exists at that index (in case there's an extra selection checkbox column).
      // Adjustment: If selection is enabled, the table usually adds an extra column at the start.
      // If `headerIndex` was calculated using `getAllByRole('columnheader')`, it should include the checkbox column if it has the columnheader role.
      // We assume columnheader role covers everything correctly.
      return cells[headerIndex]?.textContent?.trim() ?? '';
    })
    .filter((value) => value.length > 0); // Filter out empty or loading rows if any
}

beforeEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) window.localStorage.clear();
});

describe('MobixTable', () => {
  it('renders configured column headers and all provided row values', () => {
    renderUserTable();

    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rol' })).toBeInTheDocument();

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Carlos Gómez')).toBeInTheDocument();
  });

  it('shows loading row when loading is true and keepPreviousData does not apply', () => {
    renderUserTable({
      rows: [],
      loading: true,
      keepPreviousData: false,
    });

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state only when not loading and there are no rows on current page', () => {
    renderUserTable({
      rows: [],
      loading: false,
      emptyStateContent: <div>No users available</div>,
    });

    expect(screen.getByText('No users available')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('does not show loading row during refreshing when keepPreviousData is enabled and rows exist', () => {
    renderUserTable({
      loading: true,
      keepPreviousData: true,
      rows: baseRows,
    });

    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('disables pagination handlers during refreshing in server pagination mode', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();

    renderUserTable({
      paginationMode: 'server',
      page: 0,
      rowsPerPage: 2,
      totalCount: 10,
      onPageChange,
      onRowsPerPageChange,
      loading: true,
      keepPreviousData: true,
      rows: baseRows,
      pageSizeOptions: [2, 5, 10],
    });

    await user.click(screen.getByLabelText('Go to next page'));
    expect(onPageChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '5' }));
    expect(onRowsPerPageChange).not.toHaveBeenCalled();
  });

  it('allows selecting a single row and emits selected ids and selected row models', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    renderUserTable({
      enableSelection: true,
      onSelectionChange,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // The first checkbox is usually the header (select all), the second is the first row
    const firstRowCheckbox = checkboxes[1];

    await user.click(firstRowCheckbox);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const [ids, selectedRows] = onSelectionChange.mock.calls[0] as [unknown, unknown];

    expect(ids).toEqual([1]);
    expect(Array.isArray(selectedRows)).toBe(true);

    const selectedRowsTyped = selectedRows as UserRow[];
    expect(selectedRowsTyped[0]?.name).toBe('Juan Pérez');
  });

  it('renders mixed selection state on header checkbox when some rows on page are selected', async () => {
    const user = userEvent.setup();

    renderUserTable({
      enableSelection: true,
      enablePagination: true,
      paginationMode: 'client',
      initialPageSize: 2,
      pageSizeOptions: [2, 5, 10],
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0];
    const firstRowCheckbox = checkboxes[1];

    await user.click(firstRowCheckbox);

    // FIX: In JSDOM with MUI components, toBePartiallyChecked sometimes fails.
    // We check the data-indeterminate attribute which is how MUI visually handles the state.
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'true');
    expect(headerCheckbox).not.toBeChecked();
  });

  it('supports client pagination by changing visible rows when moving to next page', async () => {
    const user = userEvent.setup();

    renderUserTable({
      enablePagination: true,
      paginationMode: 'client',
      initialPageSize: 1,
      pageSizeOptions: [1, 5, 10],
    });

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María López')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Go to next page'));

    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('triggers server-side pagination callbacks when not refreshing', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();

    renderUserTable({
      paginationMode: 'server',
      page: 0,
      rowsPerPage: 2,
      totalCount: 10,
      pageSizeOptions: [2, 5, 10],
      onPageChange,
      onRowsPerPageChange,
      loading: false,
    });

    await user.click(screen.getByLabelText('Go to next page'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '5' }));
    expect(onRowsPerPageChange).toHaveBeenCalledWith(5);
  });

  it('opens download menu and calls onDownloadClick with selected format', async () => {
    const user = userEvent.setup();
    const onDownloadClick = vi.fn();

    renderUserTable({
      enableDownload: true,
      downloadFormats: ['xls', 'pdf'],
      onDownloadClick,
    });

    await user.click(screen.getByLabelText('Download'));
    await user.click(screen.getByText('Excel'));

    expect(onDownloadClick).toHaveBeenCalledWith('xls');
  });

  it('opens delete dialog and calls onDeleteClick with selected ids and selected rows', async () => {
    const user = userEvent.setup();
    const onDeleteClick = vi.fn();

    renderUserTable({
      enableSelection: true,
      enableDelete: true,
      onDeleteClick,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    await user.click(screen.getByLabelText('Delete'));
    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onDeleteClick).toHaveBeenCalledTimes(1);
    const [ids, selectedRows] = onDeleteClick.mock.calls[0] as [unknown, unknown];

    expect(ids).toEqual([1]);
    expect(Array.isArray(selectedRows)).toBe(true);
  });

  it('toggles column visibility using column chooser and persists selection in localStorage when storage key is set', async () => {
    const user = userEvent.setup();
    const columnVisibilityStorageKey = 'test-users-table';

    renderUserTable({
      enableColumnVisibility: true,
      columnVisibilityStorageKey,
    });

    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();

    await user.click(screen.getByLabelText('Mostrar selector de columnas'));
    const menu = screen.getByRole('menu');
    await user.click(within(menu).getByText('Email'));

    expect(screen.queryByRole('columnheader', { name: 'Email' })).not.toBeInTheDocument();

    const stored = window.localStorage.getItem(`mobix-table-columns:${columnVisibilityStorageKey}`);
    expect(stored).not.toBeNull();
    expect(stored).toContain('name');
  });

  it('restores column visibility from localStorage when stored values match current column ids', () => {
    const columnVisibilityStorageKey = 'test-users-table';
    window.localStorage.setItem(
      `mobix-table-columns:${columnVisibilityStorageKey}`,
      JSON.stringify(['name', 'status']),
    );

    renderUserTable({
      enableColumnVisibility: true,
      columnVisibilityStorageKey,
    });

    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Rol' })).not.toBeInTheDocument();
  });

  it('falls back to all columns when localStorage contains invalid json', () => {
    const columnVisibilityStorageKey = 'test-users-table';
    window.localStorage.setItem(`mobix-table-columns:${columnVisibilityStorageKey}`, '{invalid');

    renderUserTable({
      enableColumnVisibility: true,
      columnVisibilityStorageKey,
    });

    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rol' })).toBeInTheDocument();
  });

  it('implements client sorting by changing the displayed order when clicking sortable header', async () => {
    const user = userEvent.setup();

    renderUserTable({
      sortMode: 'client',
      // We ensure there is no default sort confusing the initial test state
      sort: null,
    });

    const header = screen.getByRole('columnheader', { name: 'Nombre' });
    // FIX: Click the button inside the header, not the header itself
    const sortButton = within(header).getByRole('button');

    // 1. Click -> Ascending
    await user.click(sortButton);
    const ascOrder = getBodyRowTextsByColumnHeader('Nombre');
    // Carlos (C), Juan (J), María (M)
    expect(ascOrder[0]).toBe('Carlos Gómez');

    // 2. Click -> Descending
    await user.click(sortButton);
    const descOrder = getBodyRowTextsByColumnHeader('Nombre');
    // María (M), Juan (J), Carlos (C)
    expect(descOrder[0]).toBe('María López');

    // 3. Click -> No Sort (returns to original)
    await user.click(sortButton);
    const noSortOrder = getBodyRowTextsByColumnHeader('Nombre');
    expect(noSortOrder[0]).toBe('Juan Pérez');
  });

  it('calls onSortChange in server sort mode and does not mutate local order when controlled sort is unchanged', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    renderUserTable({
      sortMode: 'server',
      sort: null,
      onSortChange,
    });

    const before = getBodyRowTextsByColumnHeader('Nombre');
    
    // FIX: Click the button on the sort label, not the <th>
    const header = screen.getByRole('columnheader', { name: 'Nombre' });
    const sortButton = within(header).getByRole('button');
    
    await user.click(sortButton);
    
    const after = getBodyRowTextsByColumnHeader('Nombre');

    expect(onSortChange).toHaveBeenCalledTimes(1);
    // Order should not change because in server mode the component waits for 'rows' to be updated externally
    expect(after[0]).toBe(before[0]);
  });

  it('calls onRowClick when clicking a data cell and not when clicking selection checkbox', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    renderUserTable({
      enableSelection: true,
      onRowClick,
    });

    await user.click(screen.getByText('Juan Pérez'));
    expect(onRowClick).toHaveBeenCalledTimes(1);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('expands row details without triggering onRowClick and renders the details content', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    renderUserTable({
      enableSelection: true,
      onRowClick,
      renderRowDetails: (row) => <div>{`Detalles de ${row.name}`}</div>,
    });

    const targetRow = screen
      .getAllByRole('row')
      .find((row) => within(row).queryByText('Juan Pérez'));

    if (!targetRow) throw new Error('Target row not found');

    const buttonsInRow = within(targetRow).getAllByRole('button');
    // The expand button is usually the first one if enabled
    const expandButton = buttonsInRow[0];

    await user.click(expandButton);

    expect(onRowClick).not.toHaveBeenCalled();
    expect(screen.getByText('Detalles de Juan Pérez')).toBeInTheDocument();
  });
});
