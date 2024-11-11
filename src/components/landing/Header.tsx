import { Box, Button, Grid, Typography } from '@mui/material';
import React from 'react';
// import { ReactComponent as VectorIcon } from './vector.svg';

const Header = (): JSX.Element => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 981,
        height: 75,
      }}
    >
      {/* Blurred background layer */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(3, 6, 21, 1)',
          borderRadius: '24.26px',
          filter: 'blur(1.52px)',
        }}
      />

      {/* Content layer - positioned above the blur */}
      <Box
        sx={{
          position: 'relative', // This puts the content above the blurred background
          zIndex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 51px',
        }}
      >
        <Grid container alignItems="center" spacing={10}>
          <Grid item>{/* <VectorIcon style={{ width: 48, height: 48 }} /> */}</Grid>
          <Grid item>
            <Grid container spacing={4}>
              {['About', 'Features', 'Security', 'Community'].map((text) => (
                <Grid item key={text}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Satoshi Variable, Helvetica',
                      fontSize: '18.2px',
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: '31.3px',
                    }}
                  >
                    {text}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{
                width: 235.54,
                height: 57,
                backgroundColor: '#96fd02',
                borderRadius: '16px',
                color: 'black',
                fontFamily: 'Satoshi Variable, Helvetica',
                fontSize: '18.9px',
                textAlign: 'center',
                lineHeight: '23.6px',
                '&:hover': {
                  backgroundColor: '#96fd02',
                },
              }}
            >
              Launch App
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Header;
