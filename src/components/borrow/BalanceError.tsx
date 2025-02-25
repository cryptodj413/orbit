import React from 'react';
import { Box, Typography } from '@mui/material';

const BalanceError = () => {
  return (
    <Box
      sx={{
        width: '100%',
        borderTop: '1px solid rgba(255, 255, 255, 0.32)',
        paddingBlock: '24px',
        color: 'white',
        background:
          'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
        borderBottomRightRadius: '17px',
        borderBottomLeftRadius: '17px',
      }}
    >
      <Typography
        variant="subtitle2"
        align="center"
        gutterBottom
        fontWeight="700"
        fontSize="16px"
        marginBottom="16px"
      >
        BalanceError!
      </Typography>
    </Box>
  );
};

export default BalanceError;
