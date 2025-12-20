import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import FiltersSection from '@/components/layout/filters/FiltersSection';

import {
  FiltersSectionValue,
  FiltersSectionProps,
  FiltersSectionField,
} from '@/components/layout/filters/FiltersSection.types';

type AsyncSelectOption = { label: string; value: string; code?: string };

interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isSubmitting?: boolean;
}

interface MockTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  select?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    [key: string]: unknown;
  };
  slotProps?: {
    input?: {
      startAdornment?: React.ReactNode;
      endAdornment?: React.ReactNode;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

interface MockAutocompleteProps {
  options: AsyncSelectOption[];
  value: AsyncSelectOption | null;
  loading?: boolean;
  disabled?: boolean;
  inputValue: string;
  onInputChange: (event: React.SyntheticEvent, newInputValue: string) => void;
  onChange: (event: React.SyntheticEvent, newValue: AsyncSelectOption | null) => void;
  onOpen?: () => void;
  filterOptions?: (options: AsyncSelectOption[], state: { inputValue: string }) => AsyncSelectOption[];
  // eslint-disable-next-line no-unused-vars
  renderInput: (params: { InputProps: { endAdornment?: React.ReactNode } }) => React.ReactNode;
}

// --- MOCKS ---

vi.mock('@/components/mobix/button', () => {
  const ButtonLike = ({
    children,
    startIcon,
    endIcon,
    isSubmitting,
    disabled,
    onClick,
    ...rest
  }: MockButtonProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ...domProps } = rest as Record<string, unknown>;
    if ('variant' in domProps) delete domProps.variant;

    return (
      <button
        type="button"
        disabled={Boolean(disabled) || Boolean(isSubmitting)}
        onClick={Boolean(disabled) || Boolean(isSubmitting) ? undefined : onClick}
        data-has-start-icon={Boolean(startIcon)}
        data-has-end-icon={Boolean(endIcon)}
        {...(domProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  };
  ButtonLike.displayName = 'MobixButtonMock';

  return {
    MobixButton: ButtonLike,
    MobixButtonText: ButtonLike,
    MobixButtonProgress: ButtonLike,
  };
});

vi.mock('@/components/mobix/inputs/MobixTextField', () => {
  const MobixTextField = (props: MockTextFieldProps) => {
    const { 
      select, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fullWidth, size, slotProps, InputProps, children, 
      ...rest 
    } = props;

    const startAdornment = slotProps?.input?.startAdornment || InputProps?.startAdornment;
    const endAdornment = slotProps?.input?.endAdornment || InputProps?.endAdornment;

    return (
      <div data-testid="textfield-wrapper">
        {startAdornment && <div data-testid="start-adornment">{startAdornment}</div>}
        <input role="textbox" {...rest} />
        {endAdornment && <div data-testid="end-adornment">{endAdornment}</div>}
        {select && <div style={{ display: 'none' }}>{children}</div>}
      </div>
    );
  };
  MobixTextField.displayName = 'MobixTextFieldMock';

  return { MobixTextField };
});

vi.mock('@mui/material/Autocomplete', () => {
  const Autocomplete = (props: MockAutocompleteProps) => {
    const filtered = props.filterOptions 
      ? props.filterOptions(props.options, { inputValue: props.inputValue }) 
      : props.options;
    
    const first = filtered[0] ?? null;
    const syntheticEvent = {} as React.SyntheticEvent;

    return (
      <div data-testid="autocomplete-mock">
        <input
          aria-label="async-select-input"
          disabled={Boolean(props.disabled)}
          value={props.inputValue}
          onChange={(e) => {
             props.onInputChange(syntheticEvent, e.target.value);
             // Only call onOpen if explicitly interacted with, not automatically
             // This prevents phantom calls in initial tests
          }}
          onFocus={() => {
             if (!props.disabled) props.onOpen?.();
          }}
        />
        <button
          type="button"
          aria-label="async-select-pick-first"
          disabled={Boolean(props.disabled) || first === null}
          onClick={() => props.onChange(syntheticEvent, first)}
        >
          Select First
        </button>
        
        {props.loading ? <div data-testid="mui-loading-indicator">Loading...</div> : null}
        
        <div style={{ display: 'none' }}>
           {props.renderInput({ InputProps: { endAdornment: null } })}
        </div>
      </div>
    );
  };
  Autocomplete.displayName = 'AutocompleteMock';

  return { default: Autocomplete };
});

vi.mock('@mui/material/CircularProgress', () => {
  const CircularProgress = () => <div data-testid="mui-circular-progress" />;
  CircularProgress.displayName = 'CircularProgressMock';
  return { default: CircularProgress };
});

vi.mock('@mui/icons-material/Search', () => {
  const SearchIcon = () => <svg aria-label="search-icon" />;
  SearchIcon.displayName = 'SearchIcon';
  return { default: SearchIcon };
});

vi.mock('@mui/icons-material/RotateRight', () => {
  const RotateRightIcon = () => <svg aria-label="rotate-right-icon" />;
  RotateRightIcon.displayName = 'RotateRightIcon';
  return { default: RotateRightIcon };
});

vi.mock('@mui/icons-material/KeyboardArrowDown', () => {
  const KeyboardArrowDownIcon = () => <svg aria-label="keyboard-arrow-down-icon" />;
  KeyboardArrowDownIcon.displayName = 'KeyboardArrowDownIcon';
  return { default: KeyboardArrowDownIcon };
});

vi.mock('@mui/icons-material/KeyboardArrowUp', () => {
  const KeyboardArrowUpIcon = () => <svg aria-label="keyboard-arrow-up-icon" />;
  KeyboardArrowUpIcon.displayName = 'KeyboardArrowUpIcon';
  return { default: KeyboardArrowUpIcon };
});

// --- RENDER HELPER ---

function renderFiltersSection(overrideProps: Partial<FiltersSectionProps> = {}) {
  const onFieldChange = vi.fn();
  const onClear = vi.fn();
  const onApply = vi.fn();

  const fields: FiltersSectionField[] =
    overrideProps.fields ??
    ([
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
    ] as FiltersSectionField[]);

  const values = overrideProps.values ?? ({ status: '', search: '' } as Record<string, FiltersSectionValue>);

  const props: FiltersSectionProps = {
    title: 'Filtros de búsqueda',
    fields,
    values,
    onFieldChange,
    onClear,
    onApply,
    columns: 3,
    enableRowToggle: true,
    collapsedRows: 1,
    ...overrideProps,
  };

  // We use userEvent by default (without global fake timers)
  const user = userEvent.setup();

  return { 
    ...render(<FiltersSection {...props} />), 
    props, 
    user, 
    onFieldChange, 
    onClear, 
    onApply 
  };
}

// --- TESTS ---

describe('FiltersSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers(); // Always ensure real timers at the end
  });

  // --- Basic Tests (No Fake Timers) ---

  it('renders the configured title and field labels', () => {
    renderFiltersSection();
    expect(screen.getByRole('heading', { name: 'Filtros de búsqueda' })).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('emits onFieldChange when a select field changes value', async () => {
    const { onFieldChange } = renderFiltersSection();
    const statusInput = screen.getByLabelText('Estado');

    fireEvent.change(statusInput, { target: { value: 'active' } });

    expect(onFieldChange).toHaveBeenCalled();
    const last = onFieldChange.mock.calls.at(-1);
    expect(last).toEqual(['status', 'active']);
  });

  it('emits onFieldChange when a search field changes value', async () => {
    const { onFieldChange } = renderFiltersSection();
    const searchInput = screen.getByLabelText('Buscar');

    fireEvent.change(searchInput, { target: { value: 'busqueda' } });

    expect(onFieldChange).toHaveBeenCalled();
    const last = onFieldChange.mock.calls.at(-1);
    expect(last).toEqual(['search', 'busqueda']);
  });

  it('calls onClear and onApply when the action buttons are clicked', async () => {
    const { user, onClear, onApply } = renderFiltersSection();

    await user.click(screen.getByTestId('filters-section-clear'));
    await user.click(screen.getByTestId('filters-section-apply'));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('does not render clear and apply actions when disabled by props', () => {
    renderFiltersSection({ showApplyButton: false, showClearButton: false });
    expect(screen.queryByTestId('filters-section-clear')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filters-section-apply')).not.toBeInTheDocument();
  });

  it('disables the apply action behavior when isApplying is true', async () => {
    const { onApply } = renderFiltersSection({ isApplying: true });
    const btn = screen.getByTestId('filters-section-apply');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onApply).toHaveBeenCalledTimes(0);
  });

  // --- Toggle / Collapse Tests (With Controlled Fake Timers) ---

  it('does not render the advanced-toggle when all fields fit in the collapsed area', () => {
    renderFiltersSection({
      collapsedRows: 1,
      columns: 3,
      fields: [
        { id: 'f1', label: 'F1', type: 'text' },
        { id: 'f2', label: 'F2', type: 'text' },
      ],
      values: { f1: '', f2: '' },
    });
    expect(screen.queryByTestId('filters-section-toggle')).not.toBeInTheDocument();
  });

  it('renders the advanced-toggle and hides fields beyond the collapsed area until expanded', async () => {
    const { user } = renderFiltersSection({
      collapsedRows: 1,
      columns: 3,
      fields: [
        { id: 'f1', label: 'F1', type: 'text' },
        { id: 'f2', label: 'F2', type: 'text' },
        { id: 'f3', label: 'F3', type: 'text' },
        { id: 'extra', label: 'Extra', type: 'text' },
      ],
      values: {},
    });

    expect(screen.getByTestId('filters-section-toggle')).toBeInTheDocument();
    expect(screen.getByText('F1')).toBeInTheDocument();
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('filters-section-toggle'));
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  it('keeps fields visible during collapse animation and hides them only after the collapse timeout', async () => {
    vi.useFakeTimers(); // Enable timers only for this test
    
    renderFiltersSection({
      collapsedRows: 1,
      columns: 3,
      fields: [
        { id: 'f1', label: 'F1', type: 'text' },
        { id: 'f2', label: 'F2', type: 'text' },
        { id: 'f3', label: 'F3', type: 'text' },
        { id: 'extra', label: 'Extra', type: 'text' },
      ],
      values: {},
    });

    const toggle = screen.getByTestId('filters-section-toggle');
    
    // Expand
    fireEvent.click(toggle); 
    expect(screen.getByText('Extra')).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggle);
    
    // Should remain visible immediately (timeout 350ms pending)
    expect(screen.getByText('Extra')).toBeInTheDocument();

    // Advance time almost to the end (349ms)
    act(() => {
      vi.advanceTimersByTime(349);
    });
    expect(screen.getByText('Extra')).toBeInTheDocument();

    // Finish timeout
    act(() => {
      vi.advanceTimersByTime(50);
    });
    
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();
  });

  it('renders all fields and never renders the toggle when enableRowToggle is false', () => {
    renderFiltersSection({
      enableRowToggle: false,
      collapsedRows: 1,
      columns: 3,
      fields: [
        { id: 'f1', label: 'F1', type: 'text' },
        { id: 'f2', label: 'F2', type: 'text' },
        { id: 'f3', label: 'F3', type: 'text' },
        { id: 'extra', label: 'Extra', type: 'text' },
      ],
      values: {},
    });
    expect(screen.queryByTestId('filters-section-toggle')).not.toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  // --- Special Field Tests ---

  it('renders a custom field via its render function', () => {
    const CustomComp = () => <div>Custom content</div>;
    CustomComp.displayName = 'CustomComp';
    const customRender = vi.fn(() => <CustomComp />);

    renderFiltersSection({
      fields: [{ id: 'custom', label: 'Custom', type: 'custom', render: customRender }],
      values: {},
    });

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
    expect(customRender).toHaveBeenCalledTimes(1);
  });

  // --- Async Select Tests (Logic & Debounce) ---

  it('loads async-select options only after debounce and when minCharsToSearch is satisfied', async () => {
    vi.useFakeTimers(); // Enable timers only here
    
    const loadOptions = vi.fn(async (q: string) => [
      { label: `Result ${q}`, value: `v-${q}` },
    ]);

    const fields: FiltersSectionField[] = [
      {
        id: 'async',
        label: 'Async',
        type: 'async-select',
        placeholder: 'Buscar',
        debounceMs: 300,
        minCharsToSearch: 2,
        loadOptions,
      },
    ];

    const { onFieldChange } = renderFiltersSection({
      fields,
      values: { async: null },
    });

    const asyncInput = screen.getByLabelText('async-select-input');
    
    // 1. Write "a" -> Should not load (minChars=2)
    // Use fireEvent change which is more direct with fake timers than userEvent.type
    fireEvent.change(asyncInput, { target: { value: 'a' } });
    
    act(() => { vi.advanceTimersByTime(300); });
    
    expect(loadOptions).toHaveBeenCalledTimes(0);

    // 2. Write "ab". Debounce restarts.
    fireEvent.change(asyncInput, { target: { value: 'ab' } });

    // Advance partially
    act(() => { vi.advanceTimersByTime(200); });
    expect(loadOptions).toHaveBeenCalledTimes(0);

    // Complete debounce
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(loadOptions).toHaveBeenCalledTimes(1);
    expect(loadOptions).toHaveBeenCalledWith('ab');

    // Select Option
    fireEvent.click(screen.getByLabelText('async-select-pick-first'));
    expect(onFieldChange).toHaveBeenCalledWith('async', { label: 'Result ab', value: 'v-ab' });
  });

  it('loads async-select options immediately on open when minCharsToSearch is zero and the field is enabled', async () => {
    // No fake timers here to avoid complications, as loadOptions is async immediate
    
    const loadOptions = vi.fn(async () => [
      { label: 'All', value: 'all' },
    ]);

    const fields: FiltersSectionField[] = [
      {
        id: 'async',
        label: 'Async',
        type: 'async-select',
        placeholder: 'Buscar',
        minCharsToSearch: 0,
        debounceMs: 300,
        loadOptions,
      },
    ];

    renderFiltersSection({
      fields,
      values: { async: null },
    });

    // If loadOptions is called on mount (preload), we clear the mock to test the focus interaction
    loadOptions.mockClear();

    const asyncInput = screen.getByLabelText('async-select-input');
    
    // Trigger onFocus to simulate opening the dropdown
    fireEvent.focus(asyncInput);
    
    // Wait for loadOptions promise to resolve
    await waitFor(() => {
        expect(loadOptions).toHaveBeenCalledTimes(1);
    });
    
    expect(loadOptions).toHaveBeenCalledWith('');
  });

  it('does not load async-select options when disabled is true', async () => {
    vi.useFakeTimers();

    const loadOptions = vi.fn(async (q: string) => [
      { label: `Result ${q}`, value: `v-${q}` },
    ]);

    const fields: FiltersSectionField[] = [
      {
        id: 'async',
        label: 'Async',
        type: 'async-select',
        placeholder: 'Buscar',
        minCharsToSearch: 0,
        debounceMs: 300,
        loadOptions,
        disabled: true,
      },
    ];

    renderFiltersSection({
      fields,
      values: { async: null },
    });

    const asyncInput = screen.getByLabelText('async-select-input');
    expect(asyncInput).toBeDisabled();

    // Force event even if disabled to test internal logic
    fireEvent.change(asyncInput, { target: { value: 'abc' } });
    
    act(() => {
        vi.advanceTimersByTime(350);
    });

    expect(loadOptions).toHaveBeenCalledTimes(0);
  });

  // --- Extended Coverage Tests ---

  describe('Extended Coverage', () => {
    it('renders a search icon when field type is "search"', () => {
      renderFiltersSection({
        fields: [{ id: 'q', label: 'Buscar', type: 'search' }],
        values: {},
      });

      const startAdornment = screen.getByTestId('start-adornment');
      expect(startAdornment).toBeInTheDocument();
      expect(screen.getByLabelText('search-icon')).toBeInTheDocument();
    });

    it('renders a loading spinner in the select input when loading prop is true', () => {
      renderFiltersSection({
        fields: [
          { 
            id: 'status', 
            label: 'Estado', 
            type: 'select', 
            options: [], 
            loading: true 
          }
        ],
        values: {},
      });

      const endAdornment = screen.getByTestId('end-adornment');
      expect(endAdornment).toBeInTheDocument();
      expect(screen.getByTestId('mui-circular-progress')).toBeInTheDocument();
    });

    it('filters async options by CODE as well as label (Internal Filtering Logic)', async () => {
        // Use real timers here is safer for flushing complex promises
        const loadOptions = vi.fn(async () => [
            { label: 'Camión Grande', value: '1', code: 'TRUCK-001' },
            { label: 'Auto Pequeño', value: '2', code: 'CAR-999' },
        ]);

        const fields: FiltersSectionField[] = [
            {
            id: 'async',
            label: 'Async',
            type: 'async-select',
            loadOptions,
            minCharsToSearch: 0,
            debounceMs: 0,
            }
        ];

        const { user, onFieldChange } = renderFiltersSection({ fields, values: { async: null } });

        const input = screen.getByLabelText('async-select-input');
        
        await user.click(input);
        
        // Wait for options to load
        await waitFor(() => expect(loadOptions).toHaveBeenCalled());

        // Search by code
        await user.type(input, 'TRUCK');
        
        // Pick first result
        await user.click(screen.getByLabelText('async-select-pick-first'));

        expect(onFieldChange).toHaveBeenCalledWith('async', expect.objectContaining({
            value: '1',
            code: 'TRUCK-001'
        }));
    });

    it('handles collapse timeout cleanup on unmount to prevent memory leaks', () => {
        vi.useFakeTimers();
        const { unmount } = renderFiltersSection({
            collapsedRows: 1,
            columns: 3,
            fields: [
                { id: '1', label: '1', type: 'text' },
                { id: '2', label: '2', type: 'text' },
                { id: '3', label: '3', type: 'text' },
                { id: '4', label: '4', type: 'text' },
            ],
            values: {}
        });

        fireEvent.click(screen.getByTestId('filters-section-toggle')); // Expand
        fireEvent.click(screen.getByTestId('filters-section-toggle')); // Collapse (start timer)

        unmount(); // Unmount before timer finishes

        // This advance should NOT trigger state updates or errors
        act(() => { vi.advanceTimersByTime(400); });
    });

    it('associates labels with inputs via htmlFor/id', () => {
      const { onFieldChange } = renderFiltersSection();
      const statusInput = screen.getByLabelText('Estado');
      expect(statusInput).toHaveAttribute('id', 'status');
      fireEvent.change(statusInput, { target: { value: 'active' } });
      expect(onFieldChange).toHaveBeenCalledWith('status', 'active');
    });
  });
});
