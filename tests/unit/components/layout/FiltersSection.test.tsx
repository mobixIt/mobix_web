import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import FiltersSection, {
  type FiltersSectionField,
  type FiltersSectionValues,
} from '@/components/layout/filters/FiltersSection';

vi.mock('@/components/mobix/button', () => {
  interface MockMobixButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  }

  const MobixButtonBase = ({
    children,
    startIcon,
    endIcon,
    ...props
  }: MockMobixButtonProps) => (
    <button
      data-testid="mobix-button"
      data-has-start-icon={Boolean(startIcon)}
      data-has-end-icon={Boolean(endIcon)}
      {...props}
    >
      {children}
    </button>
  );

  return {
    MobixButton: MobixButtonBase,
    MobixButtonText: MobixButtonBase,
  };
});

vi.mock('@/components/mobix/inputs/MobixTextField', () => {
  type MockProps = React.InputHTMLAttributes<HTMLInputElement> & {
    children?: React.ReactNode;
    select?: boolean;
    fullWidth?: boolean;
    size?: 'small' | 'medium';
    slotProps?: unknown;
  };

  const MobixTextField = (props: MockProps) => {
    const {
      children,
      select,
      fullWidth,
      size,
      slotProps,
      ...rest
    } = props;

    const ignored = { children, select, fullWidth, size, slotProps };
    void ignored;

    return <input role="textbox" {...rest} />;
  };

  return { MobixTextField };
});

describe('FiltersSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseFields: FiltersSectionField[] = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
      ],
      placeholder: 'Todos',
    },
    {
      id: 'search',
      label: 'Buscar',
      type: 'search',
      placeholder: 'Buscar por nombre',
    },
  ];

  const baseValues: FiltersSectionValues = {
    status: '',
    search: '',
  };

  const renderComponent = (
    overrideProps: Partial<React.ComponentProps<typeof FiltersSection>> = {},
  ) => {
    const onFieldChange = vi.fn();
    const onClear = vi.fn();
    const onApply = vi.fn();

    const props: React.ComponentProps<typeof FiltersSection> = {
      title: 'Filtros de búsqueda',
      fields: baseFields,
      values: baseValues,
      onFieldChange,
      onClear,
      onApply,
      columns: 3,
      enableRowToggle: true,
      collapsedRows: 1,
      ...overrideProps,
    };

    const utils = render(<FiltersSection {...props} />);

    return {
      ...utils,
      props,
      onFieldChange,
      onClear,
      onApply,
    };
  };

  it('renderiza el título y los labels de los filtros', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Filtros de búsqueda' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('llama onFieldChange cuando cambia un filtro select', () => {
    const { onFieldChange } = renderComponent();

    const inputs = screen.getAllByRole('textbox');
    const statusInput = inputs[0];

    fireEvent.change(statusInput, { target: { value: 'active' } });

    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenCalledWith('status', 'active');
  });

  it('llama onFieldChange cuando cambia un filtro de texto/búsqueda', () => {
    const { onFieldChange } = renderComponent();

    const inputs = screen.getAllByRole('textbox');
    const searchInput = inputs[1];

    fireEvent.change(searchInput, { target: { value: 'busqueda' } });

    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenCalledWith('search', 'busqueda');
  });

  it('ejecuta onClear y onApply al hacer click en los botones', () => {
    const { onClear, onApply } = renderComponent();

    const clearButton = screen.getByRole('button', { name: 'Limpiar filtros' });
    const applyButton = screen.getByRole('button', { name: 'Aplicar filtros' });

    fireEvent.click(clearButton);
    fireEvent.click(applyButton);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('permite ocultar los botones de limpiar y aplicar', () => {
    renderComponent({
      showApplyButton: false,
      showClearButton: false,
    });

    expect(
      screen.queryByRole('button', { name: /limpiar filtros/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /aplicar filtros/i }),
    ).not.toBeInTheDocument();
  });

  it('no muestra el toggle cuando todos los campos caben en las filas colapsadas', () => {
    // 2 campos, 3 columnas, 1 fila -> todo cabe
    renderComponent({
      fields: baseFields,
      collapsedRows: 1,
      columns: 3,
    });

    expect(
      screen.queryByRole('button', { name: /mostrar más filtros/i }),
    ).not.toBeInTheDocument();
  });

  it('muestra solo la primera fila de filtros cuando hay más campos que los de la fila colapsada', () => {
    const fields: FiltersSectionField[] = [
      ...baseFields,
      { id: 'extra1', label: 'Extra 1', type: 'text', placeholder: '' },
      { id: 'extra2', label: 'Extra 2', type: 'text', placeholder: '' },
    ];

    renderComponent({
      fields,
      collapsedRows: 1,
      columns: 3,
    });

    // Primera fila (3 columnas): status, search, extra1
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Extra 1')).toBeInTheDocument();
    // extra2 queda oculto
    expect(screen.queryByText('Extra 2')).not.toBeInTheDocument();

    // El toggle debe mostrarse
    expect(
      screen.getByRole('button', { name: /mostrar más filtros/i }),
    ).toBeInTheDocument();
  });

  it('expande y muestra todos los filtros al hacer click en "Mostrar más filtros"', () => {
    const fields: FiltersSectionField[] = [
      ...baseFields,
      { id: 'extra1', label: 'Extra 1', type: 'text', placeholder: '' },
      { id: 'extra2', label: 'Extra 2', type: 'text', placeholder: '' },
    ];

    renderComponent({
      fields,
      collapsedRows: 1,
      columns: 3,
    });

    const toggleButton = screen.getByRole('button', {
      name: /mostrar más filtros/i,
    });

    fireEvent.click(toggleButton);

    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Extra 1')).toBeInTheDocument();
    expect(screen.getByText('Extra 2')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /mostrar menos filtros/i }),
    ).toBeInTheDocument();
  });

  it('mantiene todos los campos durante el colapso y luego deja solo la primera fila después del timeout', () => {
    const fields: FiltersSectionField[] = [
      ...baseFields,
      { id: 'extra1', label: 'Extra 1', type: 'text', placeholder: '' },
      { id: 'extra2', label: 'Extra 2', type: 'text', placeholder: '' },
    ];

    renderComponent({
      fields,
      collapsedRows: 1,
      columns: 3,
    });

    // Expandir
    const expandButton = screen.getByRole('button', {
      name: /mostrar más filtros/i,
    });
    fireEvent.click(expandButton);
    expect(screen.getByText('Extra 2')).toBeInTheDocument();

    // Colapsar
    const collapseButton = screen.getByRole('button', {
      name: /mostrar menos filtros/i,
    });
    fireEvent.click(collapseButton);

    // Al inicio de la animación, aún está el campo extra
    expect(screen.getByText('Extra 2')).toBeInTheDocument();

    // Avanzamos timers (350 ms)
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Después del timeout, solo debería quedar la primera "fila" de filtros
    expect(screen.queryByText('Extra 2')).not.toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('no aplica lógica de toggle cuando enableRowToggle es false', () => {
    const fields: FiltersSectionField[] = [
      ...baseFields,
      { id: 'extra1', label: 'Extra 1', type: 'text', placeholder: '' },
      { id: 'extra2', label: 'Extra 2', type: 'text', placeholder: '' },
    ];

    renderComponent({
      fields,
      enableRowToggle: false,
      collapsedRows: 1,
      columns: 3,
    });

    expect(
      screen.queryByRole('button', { name: /mostrar más filtros/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /mostrar menos filtros/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByText('Extra 1')).toBeInTheDocument();
    expect(screen.getByText('Extra 2')).toBeInTheDocument();
  });

  it('renderiza un campo custom cuando type="custom"', () => {
    const customRender = vi.fn(() => <div>Custom content</div>);

    const fields: FiltersSectionField[] = [
      {
        id: 'custom',
        label: 'Custom',
        type: 'custom',
        render: customRender,
      },
    ];

    renderComponent({
      fields,
      values: {},
    });

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
    expect(customRender).toHaveBeenCalled();
  });
});
