import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobixTextField } from '@/components/mobix/inputs/MobixTextField';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkIcon from '@mui/icons-material/Link';
import PercentIcon from '@mui/icons-material/Percent';

// ─────────────────────────────────────────────
// Helper types
// ─────────────────────────────────────────────

type TextFieldProps = React.ComponentProps<typeof TextField>;

type InputSlotProps = {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  inputComponent?: React.ElementType | object;
  inputProps?: {
    thousandSeparator?: boolean;
    valueIsNumericString?: boolean;
    decimalScale?: number;
    fixedDecimalScale?: boolean;
    suffix?: string;
    [key: string]: unknown;
  };
};

type SlotPropsWithInput = {
  input: InputSlotProps;
};

type NumericInputProps = InputSlotProps & {
  inputProps: {
    thousandSeparator?: boolean;
    valueIsNumericString?: boolean;
    decimalScale?: number;
    fixedDecimalScale?: boolean;
    suffix?: string;
    [key: string]: unknown;
  };
};

type PickerSlots = {
  textField: React.ComponentType<TextFieldProps> | object;
};

type DateTimePickerPropsShape = {
  label?: string;
  enableAccessibleFieldDOMStructure?: boolean;
  slots: PickerSlots;
};

type MockTextFieldPropsShape = TextFieldProps & {
  slotProps: SlotPropsWithInput;
};

type AdornmentElement = React.ReactElement<{ children?: React.ReactNode }>;

// ─────────────────────────────────────────────
// Hoisted mocks (so they can be used inside vi.mock)
// ─────────────────────────────────────────────

const {
  mockTextFieldRender,
  mockMobixDatePicker,
  mockMobixTimePicker,
  mockMobixDateTimePicker,
} = vi.hoisted(() => {
  return {
    mockTextFieldRender: vi.fn<(props: TextFieldProps) => void>(),
    mockMobixDatePicker: vi.fn<(props: DateTimePickerPropsShape) => void>(),
    mockMobixTimePicker: vi.fn<(props: DateTimePickerPropsShape) => void>(),
    mockMobixDateTimePicker: vi.fn<(props: DateTimePickerPropsShape) => void>(),
  };
});

// ─────────────────────────────────────────────
// Internal module mocks
// ─────────────────────────────────────────────

vi.mock('@/components/mobix/inputs/MobixTextField.styled', () => {
  const MobixTextFieldRoot = React.forwardRef<HTMLDivElement, TextFieldProps>(
    function MobixTextFieldRoot(props, ref) {
      mockTextFieldRender(props);
      return (
        <TextField
          data-testid="mobix-textfield-root"
          inputRef={ref}
          {...props}
        />
      );
    }
  );

  return {
    MobixTextFieldRoot,
    mockTextFieldRender,
  };
});

vi.mock('@/components/mobix/inputs/MobixDatePicker', () => {
  const MobixDatePicker: React.FC<DateTimePickerPropsShape> = (props) => {
    mockMobixDatePicker(props);
    return <div data-testid="mobix-date-picker" />;
  };

  return { MobixDatePicker, mockMobixDatePicker };
});

vi.mock('@/components/mobix/inputs/MobixTimePicker', () => {
  const MobixTimePicker: React.FC<DateTimePickerPropsShape> = (props) => {
    mockMobixTimePicker(props);
    return <div data-testid="mobix-time-picker" />;
  };

  return { MobixTimePicker, mockMobixTimePicker };
});

vi.mock('@/components/mobix/inputs/MobixDateTimePicker', () => {
  const MobixDateTimePicker: React.FC<DateTimePickerPropsShape> = (props) => {
    mockMobixDateTimePicker(props);
    return <div data-testid="mobix-datetime-picker" />;
  };

  return { MobixDateTimePicker, mockMobixDateTimePicker };
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('MobixTextField', () => {
  beforeEach(() => {
    mockTextFieldRender.mockClear();
    mockMobixDatePicker.mockClear();
    mockMobixTimePicker.mockClear();
    mockMobixDateTimePicker.mockClear();
  });

  // ────────────────────────────────────────────
  // P I C K E R S  (date / time / datetime)
  // ────────────────────────────────────────────

  it('renders MobixDatePicker when mobixVariant="date"', () => {
    render(<MobixTextField mobixVariant="date" label="Date" />);

    expect(screen.getByTestId('mobix-date-picker')).toBeInTheDocument();
    expect(mockMobixDatePicker).toHaveBeenCalledTimes(1);

    const props = mockMobixDatePicker.mock.calls.at(-1)?.[0] as DateTimePickerPropsShape;

    expect(props).toMatchObject({
      label: 'Date',
      enableAccessibleFieldDOMStructure: false,
    });

    expect(props.slots).toBeDefined();
    expect(props.slots.textField).toBeDefined();
  });

  it('renders MobixTimePicker when mobixVariant="time"', () => {
    render(<MobixTextField mobixVariant="time" label="Time" />);

    expect(screen.getByTestId('mobix-time-picker')).toBeInTheDocument();
    expect(mockMobixTimePicker).toHaveBeenCalledTimes(1);

    const props = mockMobixTimePicker.mock.calls.at(-1)?.[0] as DateTimePickerPropsShape;

    expect(props).toMatchObject({
      label: 'Time',
      enableAccessibleFieldDOMStructure: false,
    });
    expect(props.slots.textField).toBeDefined();
  });

  it('renders MobixDateTimePicker when mobixVariant="datetime"', () => {
    render(<MobixTextField mobixVariant="datetime" label="Date and time" />);

    expect(screen.getByTestId('mobix-datetime-picker')).toBeInTheDocument();
    expect(mockMobixDateTimePicker).toHaveBeenCalledTimes(1);

    const props = mockMobixDateTimePicker.mock.calls.at(-1)?.[0] as DateTimePickerPropsShape;

    expect(props).toMatchObject({
      label: 'Date and time',
      enableAccessibleFieldDOMStructure: false,
    });
    expect(props.slots.textField).toBeDefined();
  });

  // ────────────────────────────────────────────
  // B A S I C   V A R I A N T S   (non pickers)
  // ────────────────────────────────────────────

  it('uses TextFieldRoot with type="text" by default', () => {
    render(<MobixTextField label="Name" />);

    expect(screen.getByTestId('mobix-textfield-root')).toBeInTheDocument();

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as TextFieldProps;

    expect(props.variant).toBe('outlined');
    expect(props.type).toBe('text');
  });

  it('uses type="password" when mobixVariant="password"', () => {
    render(<MobixTextField mobixVariant="password" label="Password" />);

    const textFieldRoot = screen.getByTestId('mobix-textfield-root');
    const input = within(textFieldRoot).getByLabelText('Password');

    expect(input).toHaveAttribute('type', 'password');
  });

  // ────────────────────────────────────────────
  // S T A R T   A D O R N M E N T S
  // ────────────────────────────────────────────

  it('shows search icon when mobixVariant="search"', () => {
    render(<MobixTextField mobixVariant="search" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const startAdornment = props.slotProps.input.startAdornment as AdornmentElement;

    expect(startAdornment.type).toBe(InputAdornment);
    const inner = startAdornment.props.children as React.ReactElement;
    expect(inner.type).toBe(SearchIcon);
  });

  it('shows phone icon when mobixVariant="phone"', () => {
    render(<MobixTextField mobixVariant="phone" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const startAdornment = props.slotProps.input.startAdornment as AdornmentElement;

    expect(startAdornment.type).toBe(InputAdornment);
    const inner = startAdornment.props.children as React.ReactElement;
    expect(inner.type).toBe(PhoneIcon);
  });

  it('shows link icon when mobixVariant="url"', () => {
    render(<MobixTextField mobixVariant="url" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const startAdornment = props.slotProps.input.startAdornment as AdornmentElement;

    expect(startAdornment.type).toBe(InputAdornment);
    const inner = startAdornment.props.children as React.ReactElement;
    expect(inner.type).toBe(LinkIcon);
  });

  it('shows $ symbol when mobixVariant="currency"', () => {
    render(<MobixTextField mobixVariant="currency" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const startAdornment = props.slotProps.input.startAdornment as AdornmentElement;

    expect(startAdornment.type).toBe(InputAdornment);
    expect(startAdornment.props.children).toBe('$');
  });

  // ────────────────────────────────────────────────────────────
  // E N D   A D O R N M E N T S   (password / percentage)
  // ────────────────────────────────────────────────────────────

  it('adds visibility toggler when mobixVariant="password"', async () => {
    const user = userEvent.setup();

    render(<MobixTextField mobixVariant="password" label="Secret" />);

    const textFieldRoot = screen.getByTestId('mobix-textfield-root');
    const input = within(textFieldRoot).getByLabelText('Secret');

    // Initially password
    expect(input).toHaveAttribute('type', 'password');

    const toggleBtn = within(textFieldRoot).getByRole('button');
    await user.click(toggleBtn);

    // After click it should be text (with the fix in the component)
    expect(input).toHaveAttribute('type', 'text');
  });

  it('shows percent icon and configures NumericFormat when mobixVariant="percentage"', () => {
    render(<MobixTextField mobixVariant="percentage" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const inputSlot = props.slotProps.input as NumericInputProps;

    const endAdornment = inputSlot.endAdornment as AdornmentElement;
    expect(endAdornment.type).toBe(InputAdornment);
    const inner = endAdornment.props.children as React.ReactElement;
    expect(inner.type).toBe(PercentIcon);

    // inputComponent is a component (forwardRef), it should be truthy
    expect(inputSlot.inputComponent).toBeDefined();
    expect(inputSlot.inputProps.thousandSeparator).toBe(true);
    expect(inputSlot.inputProps.valueIsNumericString).toBe(true);
    expect(inputSlot.inputProps.decimalScale).toBe(2);
    expect(inputSlot.inputProps.fixedDecimalScale).toBe(true);
    expect(inputSlot.inputProps.suffix).toBe('%');
  });

  // ────────────────────────────────────────────────────────────
  // N U M E R I C   V A R I A N T S  (number / currency)
  // ────────────────────────────────────────────────────────────

  it('configures react-number-format when mobixVariant="number"', () => {
    render(<MobixTextField mobixVariant="number" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const inputSlot = props.slotProps.input as NumericInputProps;

    expect(inputSlot.inputComponent).toBeDefined();
    expect(inputSlot.inputProps.thousandSeparator).toBe(true);
    expect(inputSlot.inputProps.valueIsNumericString).toBe(true);
    expect(inputSlot.inputProps.decimalScale).toBeUndefined();
  });

  it('configures react-number-format when mobixVariant="currency"', () => {
    render(<MobixTextField mobixVariant="currency" />);

    const props = mockTextFieldRender.mock.calls.at(-1)?.[0] as MockTextFieldPropsShape;
    const inputSlot = props.slotProps.input as NumericInputProps;

    expect(inputSlot.inputComponent).toBeDefined();
    expect(inputSlot.inputProps.thousandSeparator).toBe(true);
    expect(inputSlot.inputProps.valueIsNumericString).toBe(true);
    expect(inputSlot.inputProps.decimalScale).toBe(2);
    expect(inputSlot.inputProps.fixedDecimalScale).toBe(true);
    expect(inputSlot.inputProps.suffix).toBeUndefined();
  });
});
