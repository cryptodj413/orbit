import React from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TokenType } from '../../interfaces';

interface TokenSelectionProps {
  tokens: TokenType[];
  selectedToken: TokenType;
  onTokenSelect: (token: TokenType) => void;
  balance: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  alignment?: 'start' | 'end';
  decimals: number;
}

const TokenSelection: React.FC<TokenSelectionProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  balance,
  amount,
  onAmountChange,
  alignment = 'start',
  decimals,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTokenSelect = (token: TokenType) => {
    onTokenSelect(token);
    handleClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (value.includes('.')) {
        const [, decimal] = value.split('.');
        if (decimal && decimal.length > decimals) {
          return;
        }
      }
      onAmountChange(value);
    }
  };

  // Format the balance to a maximum of 7 decimal places
  const formattedBalance = Number(balance).toFixed(7);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '29.64px',
        alignItems: alignment,
        padding: '25.19px 27.58px'
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: '14.87px'}}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="33.61px"
          px={"11.32px"}
          py={"7.3px"}
          borderRadius="18.96px"
          border="1px solid white"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <Box display="flex" alignItems="center" sx={{ height: '19px' }}>
            <img src={selectedToken.icon} alt={selectedToken.code} width="15.35px" height="15.35px" />
            <Typography variant="body2" color="white" className='text-[16px] font-normal leading-[19.2px] font-satoshi'>
              {selectedToken.code}
            </Typography>
          </Box>
          <ArrowDropDownIcon />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: alignment === 'start' ? 'left' : 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: alignment === 'start' ? 'left' : 'right',
          }}
        >
          {tokens.map((token) => (
            <MenuItem key={token.contract} onClick={() => handleTokenSelect(token)}>
              <Box display="flex" alignItems="center" gap={1}>
                <img
                  src={token.icon}
                  alt={token.code}
                  width="20"
                  height="20"
                  style={{ borderRadius: '100px' }}
                />
                <Typography variant="body2">{token.code}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
        <Typography variant="body2" color="white" sx={{ textAlign: alignment, fontSize: '16px', lineHeight: '19.2px'}} className='font-satoshi'>
          Balance: {formattedBalance} {selectedToken.code}
        </Typography>
      </Box>
      <TextField
        value={amount}
        onChange={handleAmountChange}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          style: { fontSize: '24px', color: 'white' },
        }}
        sx={{
          input: { color: 'white', textAlign: alignment },
          width: '100%',
        }}
        placeholder="0.0"
      />
    </Box>
  );
};

export default TokenSelection;
