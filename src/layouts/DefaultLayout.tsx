import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { Box, styled, Card, CardContent } from '@mui/material';
import NavBar from '../components/nav/NavBar';
import bg from './background.png';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#030615',
  borderRadius: '25px',
  overflow: 'hidden',
  display: 'flex',
  width: '680px',
  padding: theme.spacing(4),
  paddingBottom: 0,
  transition: 'height 0.3s ease-in-out',
}));

const ChildrenCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [children]);

  return (
    <StyledCard sx={{ height: contentHeight ? `${contentHeight}px + 32px` : 'auto' }}>
      <CardContent sx={{ p: 0, width: '100%', height: '100%' }} ref={contentRef}>
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
        background: `url(${bg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
