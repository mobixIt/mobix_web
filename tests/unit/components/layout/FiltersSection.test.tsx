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

  it('renders the title and filter labels', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Filtros de búsqueda' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('calls onFieldChange when a select filter changes', () => {
    const { onFieldChange } = renderComponent();

    const inputs = screen.getAllByRole('textbox');
    const statusInput = inputs[0];

    fireEvent.change(statusInput, { target: { value: 'active' } });

    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenCalledWith('status', 'active');
  });

  it('calls onFieldChange when a text/search filter changes', () => {
    const { onFieldChange } = renderComponent();

    const inputs = screen.getAllByRole('textbox');
    const searchInput = inputs[1];

    fireEvent.change(searchInput, { target: { value: 'busqueda' } });

    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenCalledWith('search', 'busqueda');
  });

  it('calls onClear and onApply when clicking the buttons', () => {
    const { onClear, onApply } = renderComponent();

    const clearButton = screen.getByTestId('filters-section-clear');
    const applyButton = screen.getByTestId('filters-section-apply');

    fireEvent.click(clearButton);
    fireEvent.click(applyButton);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('allows hiding the clear and apply buttons', () => {
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

  it('does not show the toggle when all fields fit within the collapsed rows', () => {
    renderComponent({
      fields: baseFields,
      collapsedRows: 1,
      columns: 3,
    });

    expect(screen.queryByTestId('filters-section-toggle')).not.toBeInTheDocument();
  });

  it('shows only the first row of filters when there are more fields than the collapsed row can fit', () => {
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

    // First row (3 columns): status, search, extra1
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Extra 1')).toBeInTheDocument();

    // extra2 should be hidden
    expect(screen.queryByText('Extra 2')).not.toBeInTheDocument();

    // Toggle should be visible
    expect(screen.getByTestId('filters-section-toggle')).toBeInTheDocument();
  });

  it('shows all fields when the collapsed filters toggle is activated', () => {
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

    const toggleButton = screen.getByTestId('filters-section-toggle');

    fireEvent.click(toggleButton);

    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Extra 1')).toBeInTheDocument();
    expect(screen.getByText('Extra 2')).toBeInTheDocument();
  });

  it('keeps all fields visible during collapse and then shows only the first row after the timeout', () => {
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

    // Expand
    const expandButton = screen.getByTestId('filters-section-toggle');
    fireEvent.click(expandButton);
    expect(screen.getByText('Extra 2')).toBeInTheDocument();

    // Collapse
    const collapseButton = screen.getByTestId('filters-section-toggle');
    fireEvent.click(collapseButton);

    // At the start of the animation, the extra field is still visible
    expect(screen.getByText('Extra 2')).toBeInTheDocument();

    // Advance timers (350 ms)
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // After the timeout, only the first filter row should remain
    expect(screen.queryByText('Extra 2')).not.toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('does not apply toggle logic when enableRowToggle is false', () => {
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

    expect(screen.queryByTestId('filters-section-toggle')).not.toBeInTheDocument();

    expect(screen.getByText('Extra 1')).toBeInTheDocument();
    expect(screen.getByText('Extra 2')).toBeInTheDocument();
  });

  it('renders a custom field when type="custom"', () => {
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
