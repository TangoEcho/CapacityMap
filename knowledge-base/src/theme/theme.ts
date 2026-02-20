import { createTheme } from '@mui/material/styles';

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#00875A',
      light: '#33a07b',
      dark: '#005c3d',
    },
    secondary: {
      main: '#00A3A1',
      light: '#33b5b3',
      dark: '#007271',
    },
    success: {
      main: '#7AB648',
      light: '#95c56d',
      dark: '#558032',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3dba8a',
      light: '#6dd0a8',
      dark: '#00875A',
    },
    secondary: {
      main: '#00A3A1',
      light: '#33b5b3',
      dark: '#007271',
    },
    success: {
      main: '#7AB648',
      light: '#95c56d',
      dark: '#558032',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#AAAAAA',
    },
  },
});
