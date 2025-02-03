import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import settingSvg from '../../../public/icons/setting.svg';

import {
  Alert,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import copy from 'copy-to-clipboard';
import React, { useState, MouseEvent } from 'react';
import { useWallet } from '../../contexts/wallet';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';

export const WalletMenu = () => {
  const theme = useTheme();
  const { connect, disconnect, connected, walletAddress, isLoading } = useWallet();

  // snackbars
  const [openCon, setOpenCon] = useState(false);
  const [openDis, setOpenDis] = useState(false);
  const [openCopy, setOpenCopy] = useState(false);
  const [openError, setOpenError] = useState(false);
  // const [openDropdown, setOpenDropdown] = useState(false);
  const [anchorElDropdown, setAnchorElDropdown] = useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorElDropdown);

  const handleConnectWallet = (successful: boolean) => {
    if (successful) {
      setOpenCon(true);
    } else {
      setOpenError(true);
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setOpenDis(true);
  };

  const handleCopyAddress = () => {
    copy(walletAddress || '');
    setOpenCopy(true);
  };

  const handleSnackClose = () => {
    setOpenCon(false);
    setOpenDis(false);
    setOpenCopy(false);
    setOpenError(false);
  };

  const handleClickDropdown = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElDropdown(event.currentTarget);
  };

  const handleClickConnect = () => {
    if(isLoading) return ;
    connect(handleConnectWallet);
  };

  const handleClose = () => {
    handleSnackClose();
    setAnchorElDropdown(null);
  };

  return (
    <>
      {connected ? (
        <div
          id="wallet-dropdown-button"
          className='h-full rounded-lg text-white flex bg-white bg-opacity-[16%]'
        >
          <div 
            className={`w-[189px] h-full bg-richBlack text-center place-content-center font-normal text-[16px] leading-4 opacity-100 cursor-pointer`} 
            style={{
              borderRadius: openDropdown ? "8px 56px 0px 8px": "8px"
            }}
            onClick={handleCopyAddress}
          >
            {formatter.toCompactAddress(walletAddress)}
          </div>
          <button 
            className='px-2 h-full bg-none flex justify-center items-center gap-1 cursor-pointer'
            onClick={handleClickDropdown}
          >
            <img src={settingSvg.src} className='block w-4 h-4 mix-blend-hard-light text-platinum'/>
            <p className="transition-all" style={{ width: openDropdown ? '70px' : '0px', overflow: 'hidden' }}>Settings</p>
          </button>
        </div>
      ) : (
        <div
          id="connect-wallet-dropdown-button"
          className={`w-[156.85px] h-full rounded-[9.54px] bg-secondary text-center place-content-center text-[16px] leading-4 font-normal text-richBlack cursor-pointer ${isLoading? "bg-inactive cursor-not-allowed": ""}`}
          onClick={handleClickConnect}
        >
          Connect Wallet
        </div>
      )}
      <Menu
  id="wallet-dropdown-menu"
  anchorEl={anchorElDropdown}
  open={openDropdown}
  onClose={handleClose}
  sx={{
    backgroundColor: "transparent !important",
    "& .MuiPaper-root": {
      backgroundColor: "transparent !important",
      boxShadow: "none !important",
    },
    "& .MuiList-root": {
      backgroundColor: "transparent !important",
    },
  }}
  MenuListProps={{
    'aria-labelledby': 'wallet-dropdown-button',
    sx: {
      backgroundColor: "transparent !important",
    },
  }}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
  PaperProps={{
    sx: {
      backgroundColor: "transparent !important",
      boxShadow: "none !important",
    },
  }}
>
  <MenuItem
    onClick={() => {
      handleClose();
      handleCopyAddress();
    }}
    sx={{
      backgroundColor: "transparent !important",
      "&:hover": { backgroundColor: "transparent !important" },
      "&:focus": { backgroundColor: "transparent !important" },
    }}
  >
    <ListItemText>Copy address</ListItemText>
    <ListItemIcon>
      <ContentCopyIcon 
        sx={{
          marginLeft: "auto"
        }}
      />
    </ListItemIcon>
  </MenuItem>
  <MenuItem
    onClick={() => {
      handleClose();
      handleDisconnectWallet();
    }}
    sx={{ 
      backgroundColor: "transparent !important",
      "&:hover": { backgroundColor: "transparent !important" },
      "&:focus": { backgroundColor: "transparent !important" },
      color: '#E7424C',
    }}
  >
    <ListItemText>Disconnect</ListItemText>
    <ListItemIcon>
      <LogoutIcon sx={{
        marginLeft: "auto",
        color: '#E7424C' 
      }} />
    </ListItemIcon>
  </MenuItem>
</Menu>

      {/* <Menu
        id="wallet-dropdown-menu"
        anchorEl={anchorElDropdown}
        open={openDropdown}
        onClose={handleClose}
        sx={{
          backgroundColor: "transparent !important"
        }}
        MenuListProps={{
          'aria-labelledby': 'wallet-dropdown-button',
          sx: {
            // transform: `translateX(-100px)`
            // position: 'absolute',
            // left: 0
            backgroundColor: "transparent !important"
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          // @ts-ignore - TODO: Figure out why typing is broken
          backgroundColor: "transparent !important",
          boxShadow: "none", // Remove box shadow
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            handleCopyAddress();
          }}
          sx={{
            backgroundColor: "transparent !important",
            "&:hover": { backgroundColor: "transparent" },
            "&:focus": { backgroundColor: "transparent" },
          }}
        >
          <ListItemText>Copy address</ListItemText>
          <ListItemIcon>
            <ContentCopyIcon />
          </ListItemIcon>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleDisconnectWallet();
          }}
          sx={{ 
            backgroundColor: "transparent !important",
            "&:hover": { backgroundColor: "transparent" },
            "&:focus": { backgroundColor: "transparent" },
            color: '#E7424C'
          }}
        >
          <ListItemText>Disconnect</ListItemText>
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#E7424C' }} />
          </ListItemIcon>
        </MenuItem>
      </Menu> */}

      <Snackbar
        open={openCon}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet connected.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openDis}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet disconnected.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openCopy}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet address copied to clipboard.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openError}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          sx={{
            backgroundColor: theme.palette.error.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Unable to connect wallet.
        </Alert>
      </Snackbar>
    </>
  );
};