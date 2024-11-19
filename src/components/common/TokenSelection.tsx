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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: alignment,
        width: '100%',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="120px"
        height="40px"
        px={2}
        borderRadius="20px"
        border="1px solid white"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <img src={selectedToken.icon} alt={selectedToken.code} width="20" height="20" />
          <Typography variant="body2" color="white">
            {selectedToken.code}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          <ArrowDropDownIcon />
        </IconButton>
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
      <Typography variant="body2" color="white" sx={{ textAlign: alignment }}>
        Balance: {balance} {selectedToken.code}
      </Typography>
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
