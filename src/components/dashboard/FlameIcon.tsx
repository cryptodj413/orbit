import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';
import flameIcon from '../../assets/icons/flame.png';

const FlameIcon:React.FC = () => {
  return (
    <Box sx={{
        background: 'rgba(0, 0, 0)',
        borderRadius: '50%',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
    }}>
      <img src={flameIcon.src} alt="Flame Icon" />
    </Box>
  );
};

export default FlameIcon;
