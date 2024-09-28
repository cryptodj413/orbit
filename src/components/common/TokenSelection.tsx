import React from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Token {
  name: string;
  icon: string;
}

interface TokenSelectionProps {
  tokens: Token[];
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  balance: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  alignment?: 'start' | 'end'; // New prop for alignment
}

const TokenSelection: React.FC<TokenSelectionProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  balance,
  amount,
  onAmountChange,
  alignment = 'start', // Default to 'start' if not specified
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    handleClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: alignment, // Use the alignment prop here
        width: '100%', // Ensure the box takes full width for proper alignment
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
          <img src={selectedToken.icon} alt={selectedToken.name} width="20" height="20" />
          <Typography variant="body2" color="white">
            {selectedToken.name}
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
          <MenuItem key={token.name} onClick={() => handleTokenSelect(token)}>
            <Box display="flex" alignItems="center" gap={1}>
              <img
                src={token.icon}
                alt={token.name}
                width="20"
                height="20"
                style={{ borderRadius: '100px' }}
              />
              <Typography variant="body2">{token.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
      <Typography variant="body2" color="white" sx={{ textAlign: alignment }}>
        Balance: {balance} {selectedToken.name}
      </Typography>
      <TextField
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          style: { fontSize: '24px', color: 'white' },
        }}
        sx={{
          input: { color: 'white', textAlign: alignment },
          width: '100%', // Ensure the TextField takes full width
        }}
      />
    </Box>
  );
};

export default TokenSelection;
