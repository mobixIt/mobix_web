'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import FiltersSection, {
  type FiltersSectionField,
  type FiltersSectionValues,
} from '@/components/layout/filters/FiltersSection';
import theme from '@/theme';

const meta: Meta<typeof FiltersSection> = {
  title: 'Mobix/Final/Filters/FiltersSection',
  component: FiltersSection,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: (themeInstance) =>
              themeInstance.palette.background.default,
            p: 4,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'stretch',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FiltersSection>;

const usersFiltersFields: FiltersSectionField[] = [
  {
    id: 'estado',
    label: 'Estado',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todos',
    options: [
      { label: 'Activo', value: 'activo' },
      { label: 'Inactivo', value: 'inactivo' },
      { label: 'Pendiente', value: 'pendiente' },
    ],
  },
  {
    id: 'rol',
    label: 'Rol',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todos',
    options: [
      { label: 'Administrador', value: 'admin' },
      { label: 'Manager', value: 'manager' },
      { label: 'Operador', value: 'operador' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
  {
    id: 'departamento',
    label: 'Departamento',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todos',
    options: [
      { label: 'Operaciones', value: 'operaciones' },
      { label: 'Finanzas', value: 'finanzas' },
      { label: 'Recursos Humanos', value: 'rrhh' },
      { label: 'Tecnología', value: 'tecnologia' },
    ],
  },
  {
    id: 'fechaCreacion',
    label: 'Fecha de creación',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todas las fechas',
    options: [
      { label: 'Última semana', value: 'week' },
      { label: 'Último mes', value: 'month' },
      { label: 'Últimos 3 meses', value: '3months' },
      { label: 'Último año', value: 'year' },
    ],
  },
  {
    id: 'ubicacion',
    label: 'Ubicación',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todas',
    options: [
      { label: 'Ciudad de México', value: 'cdmx' },
      { label: 'Guadalajara', value: 'gdl' },
      { label: 'Monterrey', value: 'mty' },
      { label: 'Puebla', value: 'pue' },
    ],
  },
  {
    id: 'ultimoAcceso',
    label: 'Último acceso',
    type: 'select',
    colSpan: 1,
    placeholder: 'Cualquier momento',
    options: [
      { label: 'Última hora', value: '1h' },
      { label: 'Hoy', value: 'today' },
      { label: 'Esta semana', value: 'week' },
      { label: 'Este mes', value: 'month' },
    ],
  },
  {
    id: 'search',
    label: 'Búsqueda',
    type: 'search',
    colSpan: 3,
    placeholder: 'Buscar por nombre, email o ID...',
  },
];

/**
 * Full filters layout example for the "Users" page.
 * Uses local state to simulate controlled filters + Clear/Apply actions.
 */
export const UsersFiltersExample: Story = {
  render: () => {
    const [values, setValues] = React.useState<FiltersSectionValues>({});

    const handleFieldChange = (fieldId: string, value: string) => {
      setValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleClear = () => {
      setValues({});
      // Here you could also clear the table filters in a real screen
      // e.g. reset query params or call a parent callback
    };

    const handleApply = () => {
      // In a real screen, you would call your API / update the table here
      // using the current `values` object
      // console.log('Apply filters with:', values);
    };

    return (
      <FiltersSection
        title="Filtros de búsqueda"
        fields={usersFiltersFields}
        values={values}
        onFieldChange={handleFieldChange}
        columns={3}
        onClear={handleClear}
        onApply={handleApply}
        clearLabel="Limpiar filtros"
        applyLabel="Aplicar filtros"
      />
    );
  },
};

/**
 * Minimal example with only 2 columns and fewer fields.
 * Useful to see how the layout adapts to different configurations.
 */
export const CompactTwoColumns: Story = {
  render: () => {
    const [values, setValues] = React.useState<FiltersSectionValues>({});

    const fields: FiltersSectionField[] = [
      {
        id: 'estado',
        label: 'Estado',
        type: 'select',
        colSpan: 1,
        placeholder: 'Todos',
        options: [
          { label: 'Activo', value: 'activo' },
          { label: 'Inactivo', value: 'inactivo' },
        ],
      },
      {
        id: 'search',
        label: 'Búsqueda',
        type: 'search',
        colSpan: 1,
        placeholder: 'Buscar por nombre o email...',
      },
    ];

    return (
      <FiltersSection
        title="Filtros rápidos"
        fields={fields}
        values={values}
        onFieldChange={(fieldId, value) =>
          setValues((prev) => ({ ...prev, [fieldId]: value }))
        }
        columns={2}
        showClearButton={false}
        showApplyButton={false}
      />
    );
  },
};
