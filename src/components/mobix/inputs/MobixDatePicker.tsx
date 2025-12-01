'use client';

import * as React from 'react';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { MobixTextFieldRoot } from './MobixTextField.styled';

type SlotWithSx = {
  sx?: SxProps<Theme>;
} & Record<string, unknown>;

function getSlotObject(slot: unknown): SlotWithSx {
  return typeof slot === 'object' && slot !== null ? (slot as SlotWithSx) : {};
}

export function MobixDatePicker(props: DatePickerProps<true>) {
  const theme = useTheme();

  const baseSlotProps = props.slotProps ?? {};

  const layoutSlot = getSlotObject(baseSlotProps.layout);
  const calendarHeaderSlot = getSlotObject(baseSlotProps.calendarHeader);
  const daySlot = getSlotObject(baseSlotProps.day);

  const mergedSlotProps: DatePickerProps<true>['slotProps'] = {
    ...baseSlotProps,

    layout: {
      ...layoutSlot,
      sx: {
        ...layoutSlot.sx,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        p: theme.spacing(1, 1.5, 1.5),
        '& .MuiDayCalendar-weekDayLabel': {
          color: theme.palette.text.secondary,
          fontWeight: 500,
        },
      },
    },

    calendarHeader: {
      ...calendarHeaderSlot,
      sx: {
        ...calendarHeaderSlot.sx,
        px: 1.5,
        pt: 1.5,
        pb: 0.5,
        '& .MuiPickersCalendarHeader-label': {
          fontWeight: theme.typography.fontWeightBold,
          fontSize: 16,
          color: theme.palette.primary.main,
        },
      },
    },

    day: {
      ...daySlot,
      sx: {
        ...daySlot.sx,
        fontWeight: 400,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'transparent',
        color: theme.palette.text.primary,
        '&:hover': {
          bgcolor: theme.palette.neutral.light,
        },
        '&.Mui-selected': {
          backgroundColor: `${theme.palette.secondary.main} !important`,
          color: theme.palette.secondary.contrastText,
          borderColor: theme.palette.secondary.dark,
          '&:hover': {
            bgcolor: theme.palette.secondary.dark,
          },
        },
        '&.MuiPickersDay-today': {
          borderColor: theme.palette.secondary.main,
        },
        '&.Mui-disabled': {
          color: theme.palette.text.disabled,
        },
      },
    },
  };

  return (
    <DatePicker
      {...props}
      slots={{
        ...props.slots,
        textField: MobixTextFieldRoot,
      }}
      slotProps={mergedSlotProps}
    />
  );
}
