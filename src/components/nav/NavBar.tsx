import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import NavItem from './NavItem';

const NavBar: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const path = router.pathname;
    if (path.includes('/dashboard')) setActiveIndex(0);
    else if (path.includes('/swap')) setActiveIndex(1);
    else if (path.includes('/borrow')) setActiveIndex(2);
  }, [router.pathname]);

  const getHighlightStyle = () => {
    const activeItem = navItemRefs.current[activeIndex];
    if (!activeItem) return {};

    const { offsetLeft, offsetWidth } = activeItem;
    const textWidth = activeItem.querySelector('span')?.offsetWidth || 0;
    const padding = 16; // Adjust this value to control the highlight padding

    return {
      left: `${offsetLeft + (offsetWidth - textWidth) / 2 - padding / 2}px`,
      width: `${textWidth + padding}px`,
    };
  };

  return (
    <Box
      sx={{
        width: '680px',
        height: '100%',
        display: 'flex',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'space-between',
          background: '#030615',
          borderRadius: '22px',
          p: 0.4,
          px: 2,
          position: 'relative',
        }}
      >
        {['Dashboard', 'Swap', 'Borrow'].map((title, index) => (
          <NavItem
            key={title}
            to={{ pathname: `/${title.toLowerCase()}` }}
            title={title}
            isActive={activeIndex === index}
            ref={(el) => {
              navItemRefs.current[index] = el;
            }}
          />
        ))}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '80%',
            background: '#2050F2',
            borderRadius: '22px',
            transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
            ...getHighlightStyle(),
          }}
        />
      </Box>
    </Box>
  );
};

export default NavBar;
