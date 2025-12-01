import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

export const MobixTextFieldRoot = styled(TextField)(({ theme }) => ({
  // ------------------------------------------------------------
  // OUTLINED INPUT ROOT
  // ------------------------------------------------------------
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    transition:
      'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',

    '& fieldset': {
      borderColor: theme.palette.neutral.main,
    },

    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.secondary.main}26`,
      '& fieldset': {
        borderColor: theme.palette.secondary.main,
      },
    },

    '&.Mui-disabled': {
      backgroundColor: theme.palette.neutral.light,
      '& fieldset': {
        borderColor: theme.palette.neutral.main,
      },
    },

    '&.Mui-error': {
      '& fieldset': {
        borderColor: theme.palette.error.main,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${theme.palette.error.main}26`,
      },
    },
  },

  // ------------------------------------------------------------
  // HOVER only when NOT focused
  // ------------------------------------------------------------
  '&:hover .MuiOutlinedInput-root:not(.Mui-focused)': {
    backgroundColor: theme.palette.background.paper, // NO cambiar fondo
    '& fieldset': {
      borderColor: theme.palette.neutral.dark, // solo borde hover
    },
  },

  // Label should NOT change background on hover
  '&:hover .MuiOutlinedInput-root:not(.Mui-focused) + .MuiInputLabel-root': {
    backgroundColor: theme.palette.background.paper,
  },

  // ------------------------------------------------------------
  // INPUT TEXT
  // ------------------------------------------------------------
  '& .MuiInputBase-input': {
    padding: '14px 14px',
  },

  '& .MuiInputBase-input.MuiInputBase-inputSizeSmall': {
    padding: '10px 12px',
  },

  // ------------------------------------------------------------
  // LABEL
  // ------------------------------------------------------------
  '& .MuiInputLabel-root': {
    backgroundColor: theme.palette.background.paper,
    padding: '0 6px',
    zIndex: 1,
    transform: 'translate(14px, 14px) scale(1)',
    transformOrigin: 'left top',
    transition: 'color 0.2s ease, transform 0.2s ease',
  },

  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -8px) scale(0.75)',
  },

  '& .MuiInputLabel-root.Mui-focused': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.secondary.main,
  },

  '& .MuiInputLabel-root.Mui-disabled': {
    backgroundColor: theme.palette.neutral.light,
  },

  // ------------------------------------------------------------
  // HELPER TEXT
  // ------------------------------------------------------------
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginRight: 0,
  },
}));