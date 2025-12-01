import type { ChangeEvent, InputHTMLAttributes } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';
import type { OutlinedInputProps } from '@mui/material/OutlinedInput';

import type {
  DatePickerProps as MuiDatePickerProps,
  TimePickerProps as MuiTimePickerProps,
  DateTimePickerProps as MuiDateTimePickerProps,
} from '@mui/x-date-pickers';

import type {
  NumericFormatProps as BaseNumericFormatProps,
} from 'react-number-format';

/**
 * Logical Mobix input types.
 * These control behavior, not the native HTML input `type`.
 */
export type MobixVariant =
  | 'default'
  | 'password'
  | 'search'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'time'
  | 'datetime'
  | 'phone'
  | 'url';

/**
 * HTML input type used only for basic text-like variants.
 */
export type HtmlInputType = InputHTMLAttributes<HTMLInputElement>['type'];

/**
 * Public props for the MobixTextField component.
 * We keep the MUI TextField API minus the "variant" prop
 * (it is always "outlined" inside MobixTextField).
 */
export interface MobixTextFieldProps
  extends Omit<TextFieldProps, 'variant'> {
  /** Logical Mobix variant (text, password, number, date, etc.) */
  mobixVariant?: MobixVariant;
  /** Optional leading icon independent of the variant */
  startIcon?: React.ReactNode;
  /** Optional trailing icon independent of the variant */
  endIcon?: React.ReactNode;
  /**
   * Native HTML input type.
   * Used only for basic variants (default/search/phone/url/password).
   * Ignored for date/time/datetime/number/currency/percentage,
   * because those use pickers or numeric formatting.
   */
  type?: HtmlInputType;
}

/**
 * Props for the NumericFormat adapter so it behaves like
 * a MUI-controlled input (name + onChange signature).
 */
export type NumericFormatAdapterProps =
  BaseNumericFormatProps<HTMLInputElement> & {
    name?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  };

/**
 * Shape for the input slot props when passed as an object.
 * We intentionally ignore the "function slot" form for now.
 */
export type InputSlotObject = Partial<OutlinedInputProps> & {
  inputComponent?: React.ElementType;
  inputProps?: Record<string, unknown>;
};

/**
 * Helper types for MUI X pickers.
 * Note: their generic parameter is a boolean flag (accessible DOM),
 * not a Date type. We use the default `true`.
 */
export type AnyDatePickerProps = MuiDatePickerProps<true>;
export type AnyTimePickerProps = MuiTimePickerProps<true>;
export type AnyDateTimePickerProps = MuiDateTimePickerProps<true>;
