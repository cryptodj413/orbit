import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import Link from 'next/link';
import { UrlObject } from 'url';

interface NavItemProps extends Omit<ButtonProps, 'href'> {
  to: string | UrlObject;
  title: string;
  isActive: boolean;
}

const NavItem = React.forwardRef<HTMLButtonElement, NavItemProps>(
  ({ to, title, isActive, ...props }, ref) => {
    return (
      <Link href={to} passHref legacyBehavior>
        <Button
          ref={ref}
          sx={{
            color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 500,
            justifyContent: 'center',
            '&:hover': {
              background: 'none',
              color: 'white',
            },
            zIndex: 1,
            transition: 'color 0.3s ease-in-out',
            ...props.sx,
          }}
          {...props}
        >
          {title}
        </Button>
      </Link>
    );
  }
);

NavItem.displayName = 'NavItem';

export default NavItem;
