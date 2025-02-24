import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import NavBar from '../components/nav/NavBar';
import { TxStatus, useWallet } from '../contexts/wallet';
import LoadingComponent from '../components/status/loading';
import SuccessComponent from '../components/status/success';
import FailComponent from '../components/status/failed';
import bg from '../assets/background.png';

const ChildrenCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { txStatus } = useWallet();

  return (
    <div className="w-[680px] px-[23.28px] py-[25.34px] rounded-[24.78px] bg-richBlack mix-blend-hard-light  relative">
      {children}
      {txStatus === TxStatus.NONE ? (
        ''
      ) : (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-richBlack bg-opacity-95 z-20">
          {txStatus === TxStatus.BUILDING && <LoadingComponent />}
          {txStatus === TxStatus.SUBMITTING && <LoadingComponent />}
          {txStatus === TxStatus.SIGNING && <LoadingComponent />}
          {txStatus === TxStatus.SUCCESS && <SuccessComponent />}
          {txStatus === TxStatus.FAIL && <FailComponent />}
        </div>
      )}
    </div>
  );
};

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative', 
        '&::before': {
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
        className={`${(router.pathname === '/dashboard' || router.pathname === '/') && 'mix-blend-hard-light'}`}
        // className={'mix-blend-hard-light'}
      >
        <NavBar />
        <ChildrenCard>{children}</ChildrenCard>
      </Box>
    </Box>
  );
}
