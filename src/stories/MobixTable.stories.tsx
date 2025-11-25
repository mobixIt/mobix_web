import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const manyRows: UserRow[] = Array.from({ length: 57 }).map((_, index) => ({
  id: index + 1,
  name: `Usuario ${index + 1}`,
  email: `usuario${index + 1}@example.com`,
  status: index % 2 === 0 ? 'active' : 'inactive',
  role: index % 3 === 0 ? 'Admin' : index % 3 === 1 ? 'Manager' : 'Viewer',
}));

const columns: MobixTableColumn<UserRow>[] = [
  { id: 'name', label: 'Nombre', field: 'name', hideable: false },
  { id: 'email', label: 'Email', field: 'email' },
  { id: 'status', label: 'Estado', field: 'status' },
  { id: 'role', label: 'Rol', field: 'role' },
];

type UserTableProps = MobixTableProps<UserRow>;
const MobixUserTable = (props: UserTableProps) => <MobixTable<UserRow> {...props} />;

const UserRowDetailsCard: React.FC<{ row: UserRow }> = ({ row }) => (
  <div
    style={{
      padding: 16,
      borderRadius: 12,
      border: '1px solid #E5E7EB',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 24,
    }}
  >
    <div>
      <strong style={{ display: 'block', marginBottom: 8 }}>
        Detalles de {row.name}
      </strong>
      <p>Email: {row.email}</p>
      <p>Rol: {row.role}</p>
      <p>Estado: {row.status}</p>
    </div>

    <div
      style={{
        minWidth: 220,
        textAlign: 'right',
        fontSize: 12,
        color: '#6B7280',
      }}
    >
      <div>Último acceso: 2025-11-01 14:32</div>
      <div>Creado por: admin@example.com</div>
    </div>
  </div>
);

const meta: Meta<typeof MobixUserTable> = {
  title: 'Mobix/MobixTable',
  component: MobixUserTable,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof MobixUserTable>;

export const Basic: Story = {
  args: { title: 'Usuarios', rows, columns },
};

export const WithSelection: Story = {
  args: {
    title: 'Usuarios con selección',
    rows,
    columns,
    enableSelection: true,
    renderBatchActions: (ids, selectedRows) => (
      <button
        onClick={() =>
          alert(
            `Batch action on: ${ids.join(', ')}\nSelected: ${selectedRows
              .map((u) => u.name)
              .join(', ')}`
          )
        }
      >
        Custom Batch Action
      </button>
    ),
  },
};

export const WithExpandableRow: Story = {
  args: {
    title: 'Usuarios con detalles',
    rows,
    columns,
    RowDetailsComponent: UserRowDetailsCard,
  },
};

export const Loading: Story = {
  args: { title: 'Cargando…', rows: [], columns, loading: true },
};

export const WithDownload: Story = {
  args: {
    title: 'Usuarios con descarga',
    rows,
    columns,
    enableDownload: true,
    downloadFormats: ['xls', 'pdf'],
    onDownloadClick: (format) =>
      alert(`Download requested in format: ${format.toUpperCase()}`),
  },
};

export const WithDelete: Story = {
  args: {
    title: 'Usuarios',
    itemNameSingular: 'usuario',
    itemNamePlural: 'usuarios',
    rows,
    columns,
    enableSelection: true,
    enableDelete: true,
    onDeleteClick: (ids, selectedRows) => {
      alert(
        `Delete requested for IDs: ${ids.join(', ')}\nUsers: ${selectedRows
          .map((u) => u.name)
          .join(', ')}`
      );
    },
  },
};

export const ClientPagination: Story = {
  args: {
    title: 'Usuarios – paginación cliente',
    rows: manyRows,
    columns,
    enableSelection: true,
    enablePagination: true,
    paginationMode: 'client',
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25],
  },
};

export const ServerPagination: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const totalCount = manyRows.length;
    const pageRows = manyRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <MobixUserTable
        {...args}
        title="Usuarios – paginación servidor"
        rows={pageRows}
        columns={columns}
        enableSelection
        enablePagination
        paginationMode="server"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
      />
    );
  },
};

export const WithColumnVisibility: Story = {
  args: {
    title: 'Usuarios – selector columnas',
    rows,
    columns,
    enableSelection: true,
    enableColumnVisibility: true,
    columnVisibilityStorageKey: 'storybook-users-table',
    initialVisibleColumnIds: ['name', 'email', 'status'],
  },
};

export const WithRowClick: Story = {
  args: {
    title: 'Usuarios – click fila',
    rows,
    columns,
    onRowClick: (row) =>
      alert(`Click en usuario: ${row.name} (${row.email})`),
  },
};

/* --- NEW STORIES ADDED --- */

export const EmptyState: Story = {
  args: {
    title: 'Sin usuarios',
    rows: [],
    columns,
    emptyStateContent: <div>No users available</div>,
  },
};

export const ClientSorting: Story = {
  args: {
    title: 'Usuarios – ordenamiento cliente',
    rows,
    columns,
    sortMode: 'client',
  },
};

export const ServerSorting: Story = {
  args: {
    title: 'Usuarios – ordenamiento servidor',
    rows,
    columns,
    sortMode: 'server',
    onSortChange: (sort) => alert(JSON.stringify(sort)),
  },
};

export const WithInitialSort: Story = {
  args: {
    title: 'Usuarios – orden inicial',
    rows,
    columns,
    initialSort: { field: 'name', direction: 'asc' },
    sortMode: 'client',
  },
};

