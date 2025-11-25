import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

import {
  MobixTable,
  type MobixTableColumn,
  type MobixTableProps,
} from '@/components/mobix/Table';

interface UserRow {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
}

const rows: UserRow[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', status: 'active', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', status: 'inactive', role: 'Viewer' },
  { id: 3, name: 'Carlos Gómez', email: 'carlos@example.com', status: 'active', role: 'Manager' },
];

const columns: MobixTableColumn<UserRow>[] = [
  { id: 'name', label: 'Nombre', field: 'name' },
  { id: 'email', label: 'Email', field: 'email' },
  { id: 'status', label: 'Estado', field: 'status' },
  { id: 'role', label: 'Rol', field: 'role' },
];

type UserTableProps = MobixTableProps<UserRow>;

function renderUserTable(extraProps: Partial<UserTableProps> = {}) {
  const defaultProps: UserTableProps = {
    title: 'Usuarios',
    rows,
    columns,
    enableSelection: false,
    enablePagination: true,
    paginationMode: 'client',
  };

  const mergedProps = { ...defaultProps, ...extraProps };

  return render(<MobixTable<UserRow> {...(mergedProps as UserTableProps)} />);
}

beforeEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});

describe('MobixTable', () => {
  it('renders rows and columns correctly', () => {
    renderUserTable();

    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Rol')).toBeInTheDocument();

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Carlos Gómez')).toBeInTheDocument();
  });

  it('allows selecting a row and triggers onSelectionChange', () => {
    const handleSelectionChange = vi.fn();

    renderUserTable({
      enableSelection: true,
      onSelectionChange: handleSelectionChange,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const firstRowCheckbox = checkboxes[1];

    fireEvent.click(firstRowCheckbox);

    expect(handleSelectionChange).toHaveBeenCalledTimes(1);
    const [ids, selectedRows] = handleSelectionChange.mock.calls[0];

    expect(ids).toEqual([1]);
    expect(selectedRows[0].name).toBe('Juan Pérez');
  });

  it('supports client-side pagination', () => {
    renderUserTable({
      enablePagination: true,
      paginationMode: 'client',
      initialPageSize: 1,
      pageSizeOptions: [1, 5, 10],
    });

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María López')).not.toBeInTheDocument();

    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);

    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('triggers server-side pagination callbacks', () => {
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
    });

    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);
    expect(onPageChange).toHaveBeenCalledWith(1);

    const rowsPerPageTrigger = screen.getByRole('combobox');
    fireEvent.mouseDown(rowsPerPageTrigger);

    const option5 = screen.getByRole('option', { name: '5' });
    fireEvent.click(option5);

    expect(onRowsPerPageChange).toHaveBeenCalledWith(5);
  });

  it('opens download menu and triggers download callback', () => {
    const handleDownload = vi.fn();

    renderUserTable({
      enableDownload: true,
      downloadFormats: ['xls', 'pdf'],
      onDownloadClick: handleDownload,
    });

    const downloadButton = screen.getByLabelText('Download');
    fireEvent.click(downloadButton);

    fireEvent.click(screen.getByText('Excel'));

    expect(handleDownload).toHaveBeenCalledWith('xls');
  });

  it('opens delete dialog and triggers onDeleteClick', () => {
    const handleDelete = vi.fn();

    renderUserTable({
      enableSelection: true,
      enableDelete: true,
      onDeleteClick: handleDelete,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    const deleteButton = screen.getByLabelText('Delete');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(confirmButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('toggles a column visibility through column chooser', () => {
    renderUserTable({ enableColumnVisibility: true });

    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();

    const columnsButton = screen.getByLabelText('Mostrar selector de columnas');
    fireEvent.click(columnsButton);

    const menu = screen.getByRole('menu');
    const emailItem = within(menu).getByText('Email');
    fireEvent.click(emailItem);

    expect(screen.queryByRole('columnheader', { name: 'Email' })).not.toBeInTheDocument();
  });

  it('calls onSaveColumnVisibility when saving column visibility', () => {
    const handleSave = vi.fn();

    renderUserTable({
      enableColumnVisibility: true,
      columnVisibilityStorageKey: 'test-users-table',
      onSaveColumnVisibility: handleSave,
    });

    const columnsButton = screen.getByLabelText('Mostrar selector de columnas');
    fireEvent.click(columnsButton);

    const saveItem = screen.getByText('Guardar selección');
    fireEvent.click(saveItem);

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('triggers onRowClick when clicking a row', () => {
    const handleRowClick = vi.fn();

    renderUserTable({
      enableSelection: false,
      onRowClick: handleRowClick,
    });

    fireEvent.click(screen.getByText('Juan Pérez'));

    expect(handleRowClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onRowClick when clicking selection checkbox', () => {
    const handleRowClick = vi.fn();

    renderUserTable({
      enableSelection: true,
      onRowClick: handleRowClick,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(handleRowClick).not.toHaveBeenCalled();
  });

  it('does not trigger onRowClick when clicking expand button', () => {
    const handleRowClick = vi.fn();

    renderUserTable({
      enableSelection: true,
      onRowClick: handleRowClick,
      renderRowDetails: (row) => <div>Detalles de {row.name}</div>,
    });

    const dataRow = screen.getAllByRole('row').find((row) =>
      within(row).queryByText('Juan Pérez'),
    );

    const expandButton = within(dataRow!).getByRole('button');
    fireEvent.click(expandButton);

    expect(handleRowClick).not.toHaveBeenCalled();
  });

  it('renders emptyStateContent when rows list is empty', () => {
    renderUserTable({
      rows: [],
      emptyStateContent: <div>No users available</div>,
    });

    expect(screen.getByText('No users available')).toBeInTheDocument();
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
  });

  it('allows clicking header safely in client sortMode', () => {
    renderUserTable({
      sortMode: 'client',
    });

    const nameHeader = screen.getByRole('columnheader', { name: 'Nombre' });
    fireEvent.click(nameHeader);

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it.skip('calls onSortChange in server sortMode', () => {
    const handleSortChange = vi.fn();

    renderUserTable({
      sortMode: 'server',
      sort: null,
      onSortChange: handleSortChange,
    });

    const nameHeader = screen.getByRole('columnheader', { name: 'Nombre' });
    fireEvent.click(nameHeader);

    expect(handleSortChange).toHaveBeenCalledTimes(1);
  });
});
