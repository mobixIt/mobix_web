import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    neutral?: PaletteOptions['primary'];
  }
  interface TypeBackground {
    sidebar: string;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    accent: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

const theme = createTheme({
  shape: {
    borderRadius: 4,
  },
  palette: {
    mode: 'light',

    primary: {
      main: '#082A3F',
      light: '#0E3D58',
      dark: '#041A27',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#65BBB0',
      light: '#8FD2C9',
      dark: '#4A8A84',
      contrastText: '#FFFFFF',
    },

    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#B91C1C',
    },

    warning: {
      main: '#FBBF24',
      light: '#FCD34D',
      dark: '#D97706',
    },

    info: {
      main: '#2C7FFF',
      light: '#5EA8FF',
      dark: '#1E57CC',
    },

    success: {
      main: '#4ADE80',
      light: '#86EFAC',
      dark: '#22C55E',
    },

    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#082A3F',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },

    divider: '#000',

    neutral: {
      main: '#D1D5DB',
      dark: '#9CA3AF',
      light: '#F3F4F6',
    },

    accent: {
      main: '#0D3045',
      light: '#e0f3fe',
      dark: '#062034',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'sans-serif'].join(','),
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
});

export default theme;