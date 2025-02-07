import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import localFont from 'next/font/local';
import NavBar from '../components/nav/NavBar';
import LoadingComponent from '../components/status/loading';
import SuccessComponent from '../components/status/success';
import FailComponent from '../components/status/failed';
import bg from '../../public/background.png';
import { useStatus, StatusType } from '../contexts/status';

// Load the TTF font
const myFont = localFont({
  src: '../fonts/Satoshi-Variable.ttf', // Correct path
  weight: '400', // Adjust as needed
  style: 'normal',
  variable: '--font-myFont', // Optional: CSS variable
});

const ChildrenCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {status} = useStatus();

  return (
    <div className="w-[680px] px-[23.28px] py-[25.34px] rounded-[24.78px] bg-richBlack relative">
      {children}
      {
        status === undefined ? "" :
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-richBlack bg-opacity-95 z-20">
          {status === StatusType.LOADING && <LoadingComponent />}
          {status === StatusType.SUCCESS && <SuccessComponent />}
          {status === StatusType.FAILED && <FailComponent />}
        </div>
      }
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
      className={myFont.className}
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
