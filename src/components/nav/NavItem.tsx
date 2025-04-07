import React from 'react';
import { ButtonProps } from '@mui/material';
import Link from 'next/link';
import { UrlObject } from 'url';

interface NavItemProps extends Omit<ButtonProps, 'href'> {
  to: string | UrlObject;
  title: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, title, isActive }) => {
  return (
    <Link href={to} passHref legacyBehavior>
      <span
        className={`inline-block p-2 text-[16px] font-normal cursor-pointer leading-[16px] h-[35px] place-content-center rounded-2xl justify-between transition-opacity ${
          isActive ? 'bg-zaffre' : 'opacity-80 hover:opacity-100'
        }`}
      >
        {title}
      </span>
    </Link>
  );
};

NavItem.displayName = 'NavItem';

export default NavItem;
