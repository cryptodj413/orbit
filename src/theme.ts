import { createTheme } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';

// Color definitions from the design system
const colors = {
  // Primary palette
  primary: {
    main: '#0215D3', // Medium Blue
    light: '#C1C8E3', // Periwinkle
    dark: '#030615', // Rich Black
    contrastText: '#FAFBFF', // Ghost White
  },
  // Secondary palette
  secondary: {
    main: '#96FD02', // Spring Bud
    light: '#D3C002', // Citrine
    dark: '#0211A9', // Zaffer
    contrastText: '#E2E2E2', // Platinum
  },
} as const;

// Typography definitions based on the design system
const typography: TypographyOptions = {
  fontFamily: 'Roboto, Gendy, Arial, sans-serif',
  h1: {
    fontFamily: 'Satoshi Bold',
    fontSize: '61px',
    lineHeight: '76.25px',
    letterSpacing: '2%',
  },
  h2: {
    fontFamily: 'Roboto',
    fontSize: '39px',
    lineHeight: 'auto',
    letterSpacing: '2%',
  },
  h3: {
    fontFamily: 'Roboto',
    fontSize: '31px',
    lineHeight: 'auto',
    letterSpacing: '2%',
  },
  h4: {
    fontFamily: 'Roboto',
    fontSize: '25px',
    lineHeight: 'auto',
    letterSpacing: '2%',
  },
  body1: {
    fontFamily: 'Roboto',
    fontSize: '20px',
    lineHeight: 'auto',
    letterSpacing: '2%',
  },
  body2: {
    fontFamily: 'Roboto',
    fontSize: '16px',
    lineHeight: 'auto',
    letterSpacing: '0',
  },
};

// Create and export the theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: colors.primary.contrastText,
      paper: '#030615',
    },
    text: {
      primary: colors.primary.dark,
      secondary: colors.primary.light,
    },
  },
  typography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontFamily: 'Roboto',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: 'Roboto',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  spacing: 8, // Base spacing unit of 8px
});

export default theme;
