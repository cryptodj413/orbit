import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import WalletIcon from '@mui/icons-material/Wallet';
import {
  Alert,
  Box,
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
import React from 'react';
import { useWallet } from '../../contexts/wallet';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { WalletButton } from './WalletButton';
import { useSorobanReact } from '@soroban-react/core';

export const WalletMenu = () => {
  const theme = useTheme();
  const { connect, disconnect, connected, walletAddress, isLoading } = useWallet();
  const sorobanContext = useSorobanReact();
  const isSorobanConnected = Boolean(sorobanContext.activeConnector);

  // snackbars
  const [openCon, setOpenCon] = React.useState(false);
  const [openDis, setOpenDis] = React.useState(false);
  const [openCopy, setOpenCopy] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleConnectWallet = (successful: boolean) => {
    if (successful) {
      setOpenCon(true);
    } else {
      setOpenError(true);
    }
  };

  const handleDisconnectWallet = () => {
    // Disconnect both wallet and Soroban
    sorobanContext.disconnect();
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

  const [anchorElDropdown, setAnchorElDropdown] = React.useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorElDropdown);

  const handleClickDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElDropdown(event.currentTarget);
  };

  const handleClose = () => {
    handleSnackClose();
    setAnchorElDropdown(null);
  };

  // Show connected state only when both wallet and Soroban are connected
  const fullyConnected = sorobanContext.address != undefined;

  return (
    <>
      {fullyConnected ? (
        <CustomButton
          id="wallet-dropdown-button"
          onClick={handleClickDropdown}
          sx={{
            width: '100%',
            height: '44px',
            color: theme.palette.text.secondary,
            background: '#030615',
            borderRadius: '8px',
          }}
        >
          <WalletIcon />
          <Typography variant="body1" color="white">
            {formatter.toCompactAddress(sorobanContext.address)}
          </Typography>
          <ArrowDropDownIcon sx={{ color: 'white' }} />
        </CustomButton>
      ) : (
        <WalletButton />
      )}

      <Menu
        id="wallet-dropdown-menu"
        anchorEl={anchorElDropdown}
        open={openDropdown}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'wallet-dropdown-button',
          sx: {
            width: anchorElDropdown && anchorElDropdown.offsetWidth,
            backgroundColor: '#030615',
            color: 'white',
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#030615',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            handleCopyAddress();
          }}
          sx={{ color: 'white' }}
        >
          <ListItemText>Copy address</ListItemText>
          <ListItemIcon>
            <ContentCopyIcon sx={{ color: 'white' }} />
          </ListItemIcon>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleDisconnectWallet();
          }}
          sx={{ color: '#E7424C' }}
        >
          <ListItemText>Disconnect</ListItemText>
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#E7424C' }} />
          </ListItemIcon>
        </MenuItem>
      </Menu>

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
