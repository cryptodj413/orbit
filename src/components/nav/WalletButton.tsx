import { Button } from '@mui/material';

import { AppContext } from '../../contexts';
import React, { useContext } from 'react';

export function WalletButton({ style, light }: { style?: React.CSSProperties; light?: boolean }) {
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const handleClick = () => {
    setConnectWalletModalOpen(true);
  };

  return (
    <>
      <Button onClick={handleClick}>Connect Wallet</Button>
    </>
  );
}
