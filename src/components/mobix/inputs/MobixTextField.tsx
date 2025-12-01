'use client';

import * as React from 'react';
import { useState, type ChangeEvent } from 'react';
import type { TextFieldProps } from '@mui/material/TextField';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import SearchIcon from '@mui/icons-material/Search';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PercentIcon from '@mui/icons-material/Percent';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkIcon from '@mui/icons-material/Link';

import { NumericFormat } from 'react-number-format';

import { MobixDatePicker } from './MobixDatePicker';
import { MobixTextFieldRoot } from './MobixTextField.styled';
import { MobixTimePicker } from './MobixTimePicker';
import { MobixDateTimePicker } from './MobixDateTimePicker';
import { DEFAULT_MOBIX_VARIANT } from './MobixTextField.constants';
import {
  type MobixTextFieldProps,
  type HtmlInputType,
  type NumericFormatAdapterProps,
  type InputSlotObject,
  type AnyDatePickerProps,
  type AnyTimePickerProps,
  type AnyDateTimePickerProps,
} from './MobixTextField.types';

/**
 * Adapter for react-number-format to work as a MUI inputComponent.
 */
const NumericFormatAdapter = React.forwardRef<
  HTMLInputElement,
  NumericFormatAdapterProps
>(function NumericFormatAdapter(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        if (!onChange) return;

        onChange({
          target: {
            // We use props.name for the synthetic event,
            // but still let `name` travel inside `other` to <NumericFormat />.
            name: props.name ?? '',
            value: values.value,
          },
        } as ChangeEvent<HTMLInputElement>);
      }}
    />
  );
});

export const MobixTextField: React.FC<MobixTextFieldProps> = ({
  mobixVariant = DEFAULT_MOBIX_VARIANT,
  startIcon,
  endIcon,
  slotProps,
  type,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Date/Time variants -> use MUI X pickers.
   * You must wrap the app with <LocalizationProvider>.
   *
   * We cast `rest` to the corresponding picker props type,
   * but keep MobixTextField's public API in terms of TextFieldProps.
   */
  if (mobixVariant === 'date') {
    const pickerProps = rest as unknown as Partial<AnyDatePickerProps>;

    return (
      <MobixDatePicker
        {...pickerProps}
        enableAccessibleFieldDOMStructure={false}
        slots={{
          textField:
            MobixTextFieldRoot as React.ComponentType<TextFieldProps>,
        }}
      />
    );
  }

  if (mobixVariant === 'time') {
    const pickerProps = rest as unknown as Partial<AnyTimePickerProps>;

    return (
      <MobixTimePicker
        {...pickerProps}
        enableAccessibleFieldDOMStructure={false}
        slots={{
          textField:
            MobixTextFieldRoot as React.ComponentType<TextFieldProps>,
        }}
      />
    );
  }

  if (mobixVariant === 'datetime') {
    const pickerProps = rest as unknown as Partial<AnyDateTimePickerProps>;

    return (
      <MobixDateTimePicker
        {...pickerProps}
        enableAccessibleFieldDOMStructure={false}
        slots={{
          textField:
            MobixTextFieldRoot as React.ComponentType<TextFieldProps>,
        }}
      />
    );
  }

  // For all other variants, we render a styled text field.
  const isPassword = mobixVariant === 'password';

  const htmlInputType: HtmlInputType = isPassword
    ? (showPassword ? 'text' : 'password')
    : ((type as HtmlInputType) ?? 'text');

  /**
   * slotProps.input can be:
   *  - an object with props (we support this shape)
   *  - a function (ownerState) => props (we leave this untouched)
   *
   * We only read/extend it when it is an object.
   */
  const rawInputSlot = slotProps?.input;
  const existingInputSlot: InputSlotObject =
    rawInputSlot && typeof rawInputSlot === 'object'
      ? (rawInputSlot as InputSlotObject)
      : {};

  const baseStartAdornment = existingInputSlot.startAdornment;
  const baseEndAdornment = existingInputSlot.endAdornment;

  /**
   * Start adornment based on variant and optional custom icon.
   */
  const adornmentStart =
    mobixVariant === 'search' ? (
      <InputAdornment position="start">
        <SearchIcon fontSize="small" />
      </InputAdornment>
    ) : mobixVariant === 'phone' ? (
      <InputAdornment position="start">
        <PhoneIcon fontSize="small" />
      </InputAdornment>
    ) : mobixVariant === 'url' ? (
      <InputAdornment position="start">
        <LinkIcon fontSize="small" />
      </InputAdornment>
    ) : mobixVariant === 'currency' ? (
      <InputAdornment position="start">$</InputAdornment>
    ) : startIcon ? (
      <InputAdornment position="start">{startIcon}</InputAdornment>
    ) : (
      baseStartAdornment
    );

  /**
   * End adornment based on variant and optional custom icon.
   * Note: date/time/datetime variants never reach this block
   * because they are handled by MUI X pickers above.
   */
  const adornmentEnd =
    isPassword ? (
      <InputAdornment position="end">
        <IconButton
          size="small"
          edge="end"
          color="accent"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ) : mobixVariant === 'percentage' ? (
      <InputAdornment position="end">
        <PercentIcon fontSize="small" />
      </InputAdornment>
    ) : endIcon ? (
      <InputAdornment position="end">{endIcon}</InputAdornment>
    ) : (
      baseEndAdornment
    );

  /**
   * Base input slot object with adornments applied.
   */
  const inputSlot: InputSlotObject = {
    ...existingInputSlot,
    startAdornment: adornmentStart,
    endAdornment: adornmentEnd,
  };

  /**
   * Numeric variants use react-number-format as the inputComponent.
   */
  if (
    mobixVariant === 'number' ||
    mobixVariant === 'currency' ||
    mobixVariant === 'percentage'
  ) {
    // Cast through `unknown` to the exact type expected by the slot
    inputSlot.inputComponent =
      NumericFormatAdapter as unknown as InputSlotObject['inputComponent'];

    inputSlot.inputProps = {
      ...(inputSlot.inputProps ?? {}),
      thousandSeparator: true,
      valueIsNumericString: true,
      ...(mobixVariant === 'currency'
        ? { decimalScale: 2, fixedDecimalScale: true }
        : {}),
      ...(mobixVariant === 'percentage'
        ? { decimalScale: 2, fixedDecimalScale: true, suffix: '%' }
        : {}),
    };
  }

  return (
    <MobixTextFieldRoot
      {...rest}
      variant="outlined"
      type={htmlInputType}
      slotProps={{
        ...slotProps,
        input: inputSlot,
      }}
    />
  );
};

export default MobixTextField;
