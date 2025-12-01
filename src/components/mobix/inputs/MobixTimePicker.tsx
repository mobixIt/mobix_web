'use client';

import * as React from 'react';
import { TimePicker, type TimePickerProps } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { MobixTextFieldRoot } from './MobixTextField.styled';

type SlotWithSx = {
  sx?: SxProps<Theme>;
} & Record<string, unknown>;

function getSlotObject(slot: unknown): SlotWithSx {
  return typeof slot === 'object' && slot !== null ? (slot as SlotWithSx) : {};
}

export function MobixTimePicker(props: TimePickerProps<true>) {
  const theme = useTheme();

  const baseSlotProps = props.slotProps ?? {};

  const layoutSlot = getSlotObject(baseSlotProps.layout);
  const toolbarSlot = getSlotObject(baseSlotProps.toolbar);
  const digitalClockSectionItemSlot = getSlotObject(
    baseSlotProps.digitalClockSectionItem
  );

  const mergedSlotProps: TimePickerProps<true>['slotProps'] = {
    ...baseSlotProps,

    layout: {
      ...layoutSlot,
      sx: {
        ...layoutSlot.sx,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        padding: '16px 24px',
        width: 320,

        '& .MuiTypography-root': {
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
        },

        '& .MuiMultiSectionDigitalClock-root': {
          display: 'flex',
          height: 256,
          borderBottom: `1px solid ${theme.palette.neutral.light}`,
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
    <TimePicker
      {...props}
      slots={{
        ...props.slots,
        textField: MobixTextFieldRoot,
      }}
      slotProps={mergedSlotProps}
    />
  );
}
