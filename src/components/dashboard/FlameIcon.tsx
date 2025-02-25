import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';
import flameIcon from '../../../public/icons/flame.png';

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
      <Image src={flameIcon.src} alt="Flame Icon" width={32} height={32}/>
    </Box>
  );
};

export default FlameIcon;
