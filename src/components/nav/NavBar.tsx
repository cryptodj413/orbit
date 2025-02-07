import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import NavItem from './NavItem';
import { WalletMenu } from './WalletMenu';

const NavBar: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const path = router.pathname;
    if (path.includes('/dashboard')) setActiveIndex(0);
    else if (path.includes('/swap')) setActiveIndex(1);
    else if (path.includes('/borrow')) setActiveIndex(2);
  }, [router.pathname]);

  return (
    <div className="w-[680px] h-12 flex justify-between items-center">
      <div className="flex gap-4 space justify-between rounded-[22px] w-[279px] h-full items-center bg-richBlack px-4 mix-blend-hard-light">
        {['Dashboard', 'Swap', 'Borrow'].map((title, index) => (
          <NavItem
            key={title}
            to={{ pathname: `/${title.toLowerCase()}` }}
            title={title}
            isActive={activeIndex === index}
          />
        ))}
      </div>
      <div className="flex justify-end w-min h-full">
        <WalletMenu />
      </div>
    </div>
  );
};

export default NavBar;
