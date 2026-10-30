import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'rtl',

  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },

  typography: {
    fontFamily: 'Vazirmatn, Arial, sans-serif',
  },

  shape: {
    borderRadius: 8,
  },
});
