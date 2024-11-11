import React from 'react';
import { Box, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../themes/landing';

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
