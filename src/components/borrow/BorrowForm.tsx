import React from 'react';
import { Box, Typography, Select, MenuItem, InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Icon from '../../../public/icons/Borrow.svg';
import XlmIcon from '../../../public/icons/tokens/xlm.svg';
import OusdIcon from '../../../public/icons/tokens/ousd.svg';

const StyledInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    border: 'none',
    borderRadius: 4,
    padding: '2px',
    color: 'white',
    fontSize: '2.125rem',
    lineHeight: '37px',
    fontFamily: theme.typography.h4.fontFamily,
    fontWeight: theme.typography.h4.fontWeight,
    textAlign: 'center',
    '&:focus': {
      outline: 'none',
    },
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: 'white',
    WebkitTextFillColor: 'white',
    cursor: 'not-allowed',
  },
}));
interface BorrowFormProps {
  collateralAmount: string;
  borrowAmount: string;
  assetToBase: number | undefined;
  collateralRatio: number;
  onBorrowChange: (value: string) => void;
}

const BorrowForm: React.FC<BorrowFormProps> = ({
  collateralAmount,
  borrowAmount,
  onBorrowChange,
}) => {
  const handleBorrowChange = (value: string) => {
    // Allow empty string
    if (value === '') {
      onBorrowChange('');
      return;
    }

    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      onBorrowChange(value);
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingInline: '48px',
      }}
    >
      {/* Borrow Input (USDC) */}
      <Box
        sx={{
          width: '42%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <StyledInput
            value={collateralAmount}
            onChange={(e) => handleBorrowChange(e.target.value)}
            placeholder="0.00"
            type="text"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.]?[0-9]*',
            }}
          />
          <Typography color="white" sx={{ ml: 1, fontSize: '30px', fontWeight: 500 }}>
            XLM
          </Typography>
        </Box>
        <Select
          value="XLM"
          IconComponent={null}
          sx={{
            mt: 1,
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            width: '100%',
            height: '48px',
            borderRadius: '7px',
          }}
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={XlmIcon.src} width="18px" height="18px" alt="oUSD" />
              <Typography>
                Stellar Lumen (XLM) <KeyboardArrowDownIcon />
              </Typography>
            </Box>
          )}
        >
          <MenuItem
            value="XLM"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}
          >
            <img src={XlmIcon.src} width="18px" height="18px" alt="XLM" />
            <Typography>Stellar Lumen (XLM)</Typography>
          </MenuItem>
        </Select>
      </Box>

      <Box sx={{ color: 'white', fontSize: 24 }}>
        <img src={Icon.src} />
      </Box>

      {/* Supply Display (XLM) */}
      <Box
        sx={{
          width: '42%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <StyledInput value={borrowAmount} disabled placeholder="0.00" type="text" />
          <Typography color="white" sx={{ ml: 1, fontSize: '30px', fontWeight: 500 }}>
            oUSD
          </Typography>
        </Box>
        <Select
          value="oUSD"
          id="demo-select-small"
          IconComponent={null}
          sx={{
            mt: 1,
            color: 'white !important',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            width: '100%',
            height: '48px',
            borderRadius: '7px',
          }}
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={OusdIcon.src} width="18px" height="18px" alt="oUSD" />
              <Typography>
                Orbital Dollar (oUSD)
                <KeyboardArrowDownIcon />
              </Typography>
            </Box>
          )}
        >
          <MenuItem value="oUSD" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={OusdIcon.src} width="18px" height="18px" alt="oUSD" />
            <Typography>Orbital Dollar (oUSD)</Typography>
          </MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default BorrowForm;
