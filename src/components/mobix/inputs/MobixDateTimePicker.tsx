'use client';

import * as React from 'react';
import {
  DateTimePicker,
  type DateTimePickerProps,
} from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { MobixTextFieldRoot } from './MobixTextField.styled';

type SlotWithSx = {
  sx?: SxProps<Theme>;
} & Record<string, unknown>;

function getSlotObject(slot: unknown): SlotWithSx {
  return typeof slot === 'object' && slot !== null ? (slot as SlotWithSx) : {};
}

export function MobixDateTimePicker(props: DateTimePickerProps<true>) {
  const theme = useTheme();

  const baseSlotProps = props.slotProps ?? {};

  const layoutSlot = getSlotObject(baseSlotProps.layout);
  const calendarHeaderSlot = getSlotObject(baseSlotProps.calendarHeader);
  const daySlot = getSlotObject(baseSlotProps.day);
  const toolbarSlot = getSlotObject(baseSlotProps.toolbar);
  const digitalClockSectionItemSlot = getSlotObject(
    baseSlotProps.digitalClockSectionItem
  );

  const mergedSlotProps: DateTimePickerProps<true>['slotProps'] = {
    ...baseSlotProps,

    layout: {
      ...layoutSlot,
      sx: {
        ...layoutSlot.sx,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        padding: '16px 24px',
        width: 640,

        '& .MuiTypography-root': {
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
        },

        '& .MuiPickersLayout-contentWrapper': {
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          columnGap: theme.spacing(3),
          alignItems: 'stretch',
        },

        '& .MuiDayCalendar-weekDayLabel': {
          color: theme.palette.text.secondary,
          fontWeight: 500,
        },

        '& .MuiMultiSectionDigitalClock-root': {
          display: 'flex',
          height: 256,
          borderLeft: 'none',
        },

        '& .MuiMultiSectionDigitalClockSection-root': {
          flex: 1,
          position: 'relative',
          paddingBlock: theme.spacing(1),
          borderLeft: 'none',
          display: 'flex',
          flexDirection: 'column',

          '&:not(:last-of-type)': {
            borderRight: `1px solid ${theme.palette.neutral.light}`,
          },

          '& ul': {
            listStyle: 'none',
            margin: 0,
            padding: theme.spacing(0.5, 0),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            overflowY: 'auto',
          },
        },

        '& .MuiMultiSectionDigitalClockSection-root:not(:first-of-type)': {
          borderLeft: 'none',
        },

        '& .MuiMultiSectionDigitalClockSection-label': {
          textTransform: 'uppercase',
          fontSize: 12,
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.text.secondary,
          letterSpacing: '0.05em',
          textAlign: 'center',
          marginBottom: theme.spacing(1.5),
        },

        '& .MuiDivider-root': {
          borderColor: theme.palette.neutral.light,
        },

        '& .MuiPickersLayout-actionBar': {
          mt: 2,
          padding: '0 !important',
        },

        '& .MuiPickersLayout-actionBar .MuiButton-root': {
          textTransform: 'none',
          fontWeight: theme.typography.fontWeightMedium,
          borderRadius: 1,
          boxShadow: 'none',
        },

        '& .MuiPickersLayout-actionBar .MuiButton-root:first-of-type': {
          color: theme.palette.primary.main,
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: theme.palette.neutral.light,
          },
        },

        '& .MuiPickersLayout-actionBar .MuiButton-root:last-of-type': {
          color: theme.palette.secondary.contrastText,
          backgroundColor: theme.palette.secondary.main,
          boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
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

    toolbar: {
      ...toolbarSlot,
      sx: {
        ...toolbarSlot.sx,
        '& .MuiPickersToolbar-title': {
          fontWeight: theme.typography.fontWeightBold,
          color: theme.palette.primary.main,
        },
      },
    },

    digitalClockSectionItem: {
      ...digitalClockSectionItemSlot,
      sx: {
        ...digitalClockSectionItemSlot.sx,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: 'auto',
        minWidth: 'auto',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: theme.typography.fontWeightMedium,
        paddingBlock: theme.spacing(1),
        paddingInline: theme.spacing(2),
        borderRadius: 1,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'transparent',
        cursor: 'pointer',
        transition:
          'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.neutral.light,
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          borderColor: theme.palette.secondary.dark,
          boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
        },
        '&.Mui-disabled': {
          color: theme.palette.text.disabled,
          opacity: 0.5,
          cursor: 'not-allowed',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      },
    },
  };

  return (
    <DateTimePicker
      {...props}
      slots={{
        ...props.slots,
        textField: MobixTextFieldRoot,
      }}
      slotProps={mergedSlotProps}
    />
  );
}
