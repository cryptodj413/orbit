import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import React from 'react';

export const appTheme = createTheme({
  palette: {
    primary: {
      main: 'rgba(32, 80, 242, 1)',
    },
    secondary: {
      main: 'rgba(150, 253, 2, 1)',
    },
    error: {
      main: 'rgba(238, 31, 31, 1)',
    },
    background: {
      default: 'rgba(3, 6, 21, 1)',
    },
    text: {
      primary: 'rgba(226, 226, 226, 1)',
      secondary: 'rgba(193, 200, 227, 1)',
    },
  },
  typography: {
    fontFamily: 'Satoshi Variable, Helvetica',
    h1: {
      fontSize: '61px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h2: {
      fontSize: '49px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h5: {
      fontSize: '25px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    subtitle1: {
      fontSize: '21.4px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '120%',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.h2,
        }),
        head: ({ theme }) => ({
          ...theme.typography.subtitle1,
        }),
        body: ({ theme }) => ({
          ...theme.typography.body1,
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }) => ({
          ...theme.typography.h2,
        }),
        secondary: ({ theme }) => ({
          ...theme.typography.body1,
        }),
      },
    },
  },
});
