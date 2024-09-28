import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5', // Blue color from the UI
    },
    secondary: {
      main: '#c8ff00', // Lime green color from the "Connect Wallet" button
    },
    background: {
      default: '#0a0a0a', // Very dark background
      paper: '#030615', // Slightly lighter background for cards
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Satoshi Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
