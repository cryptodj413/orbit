import React from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, TextField } from '@mui/material';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import arrowDown from '../../../public/icons/arrowdown.svg';
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
    // console.log(`selected token`, token);
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
        padding: '25.19px 27.58px',
      }}
    >
      <div
        className={`flex flex-col w-full ${alignment === 'start' ? 'items-start' : 'items-end'}`}
      >
        <button
          className="flex items-center gap-[5.12px] px-[12.18px] py-[7.3px] rounded-[18.96px] border-[0.37px] border-white w-min"
          onClick={handleClick}
        >
          <div className="flex items-center h-[19px]">
            <div className="w-[15.35px] h-[15.35px] mr-[5.12px]">
              <img src={selectedToken.icon} alt={selectedToken.code} width="100%" height="100%" />
            </div>
            <div className="text-[16px] text-white font-normal leading-[19.2px]">
              {selectedToken.code}
            </div>
          </div>
          <div className="w-[6.43px] h-[3.84px]">
            <img src={arrowDown.src} alt="*" width="100%" height="100%" />
          </div>
        </button>
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
        <p className="text-[16px] leading-[19.2px] mt-[14.87px]">
          Balance: {Number(formattedBalance).toFixed(2)} {selectedToken.code}
        </p>
      </div>
      <TextField
        value={amount}
        onChange={handleAmountChange}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          style: { fontSize: '27.58px', fontWeight: 700 },
        }}
        sx={{
          '& .MuiInputBase-input': {
            fontWeight: 700,
          },
          input: {
            color: 'white',
            textAlign: alignment,
            lineHeight: '41.35px',
            letterSpacing: '8%',
            fontWeight: 700,
          },
          width: '100%',
        }}
        placeholder="0.0"
      />
    </Box>
  );
};

export default TokenSelection;
