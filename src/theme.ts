import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1E6687',       // Azul medio
      dark: '#003B5C',       // Azul profundo (títulos y texto)
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F28C28',       // Naranja (alertas o acentos)
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#5EC8D0',       // Aqua
    },
    success: {
      main: '#7AC045',       // Verde lima
    },
    background: {
      default: '#F9FAFB',    // Fondo general
      paper: '#FFFFFF',      // Tarjetas y formularios
    },
    text: {
      primary: '#003B5C',    // Texto en títulos
      secondary: '#374151',  // Texto en labels
    },
    neutral: {
      main: '#D1D5DB',       // Borde de inputs
    },
  },
  typography: {
    fontFamily: ['Inter', 'Poppins', 'Montserrat', 'sans-serif'].join(','),
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          margin: '0 0 24px 0',
          '&:last-child': {
            marginBottom: 0,
          },
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          border: '1px solid #D1D5DB',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
        },
        input: {
          color: '#003B5C',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#374151',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          py: 1.5,
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
          backgroundColor: '#1E6687',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#12445A',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          margin: 0,
        }
      }
    }
  },
});

export default theme;