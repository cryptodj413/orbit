// import { Button } from '@mui/material';
// import { AppContext } from '../../contexts';
// import React, { useContext } from 'react';

// export function WalletButton({ style, light }: { style?: React.CSSProperties; light?: boolean }) {
//   const { ConnectWalletModal } = useContext(AppContext);
//   const { setConnectWalletModalOpen } = ConnectWalletModal;

//   const handleClick = () => {
//     setConnectWalletModalOpen(true);
//   };

//   return (
//     <Button
//       id="connect-wallet-dropdown-button"
//       variant="contained"
//       onClick={handleClick}
//       sx={{
//         height: '44px',
//         width: '100%',
//         backgroundColor: '',
//         color: 'white',
//         borderRadius: '8px',
//         '&:hover': {
//           backgroundColor: '#1565c0',
//         },
//         '&:disabled': {
//           backgroundColor: '#1a2847',
//           color: 'rgba(255, 255, 255, 0.3)',
//         },
//       }}
//     >
//       Connect Wallet
//     </Button>
//   );
// }
