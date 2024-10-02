import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { Box, styled, Card, CardContent } from '@mui/material';
import NavBar from '../components/nav/NavBar';
import bg from './background.png';
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

  const updateHeight = () => {
    if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      setContentHeight(newHeight);
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      // Reset height when route changes
      setContentHeight(undefined);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    updateHeight();

    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(updateHeight);
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    // Set up a ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(updateHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // Use requestAnimationFrame to ensure we're updating after layout calculations
    const rafId = requestAnimationFrame(updateHeight);

    // Clean up observers on component unmount
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [children]);

  // Force re-render on children change
  useEffect(() => {
    setContentHeight(undefined);
    const timerId = setTimeout(updateHeight, 0);
    return () => clearTimeout(timerId);
  }, [children]);

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
