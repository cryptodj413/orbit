import React from 'react';
import { Box, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../themes/landing';
import bg from './background_landing.png';

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={appTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: `url(${bg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
