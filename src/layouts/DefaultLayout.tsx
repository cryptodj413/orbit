import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import NavBar from '../components/nav/NavBar';
import bg from '../../public/background.png';

const ChildrenCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <div className='w-[680px] px-[23.28px] py-[25.34px] rounded-[24.78px] bg-richBlack'>
      {children}
    </div>
  );
};

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative', // Add this
        '&::before': {
          // Add overlay
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url(${bg.src})`,
          backgroundColor: 'black',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.0)', // Adjust value between 0-1
          zIndex: 0,
        },
        '& > *': {
          // Make children appear above overlay
          position: 'relative',
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          alignItems: 'center',
          my: 'auto',
        }}
      >
        <NavBar />
        <ChildrenCard>{children}</ChildrenCard>
      </Box>
    </Box>
  );
}
