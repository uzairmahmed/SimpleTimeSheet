import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#143D75',
      contrastText: '#fff',
    },
    secondary: {
      main: '#3F9A91',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F4ED',
      paper: '#fff',
    },
    text: {
      primary: '#1F273A',
      secondary: '#3F9A91',
    },
  },
  typography: {
    fontFamily: [
      '"Quicksand"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, fontSize: '2.4rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.6rem' },
    h4: { fontWeight: 600, fontSize: '1.2rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.92rem' },
    button: { fontWeight: 600, letterSpacing: 0.5 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;