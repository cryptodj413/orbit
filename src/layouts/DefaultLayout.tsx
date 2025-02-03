import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { Box, styled, Card, CardContent } from '@mui/material';
import NavBar from '../components/nav/NavBar';
import bg from '../../public/background.png';
import { useRouter } from 'next/router';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#030615',
  borderRadius: '25px',
  overflow: 'hidden',
  display: 'flex',
  width: '680px',
  padding: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  transition: 'height 0.3s ease-in-out',
}));

const ChildrenCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setContentHeight(undefined);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <StyledCard sx={{ height: contentHeight ? `calc(${contentHeight}px + 64px)` : 'auto' }}>
      <CardContent
        sx={{ p: 0, width: '100%', height: '100%', pb: '0px !important' }}
        ref={contentRef}
      >
        {children}
      </CardContent>
    </StyledCard>
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
