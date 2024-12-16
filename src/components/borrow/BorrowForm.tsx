import React from 'react';
import { Box, Typography, Select, MenuItem, InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    border: 'none',
    borderRadius: 4,
    padding: '2px',
    color: 'white',
    fontSize: '2.125rem',
    fontFamily: theme.typography.h4.fontFamily,
    fontWeight: theme.typography.h4.fontWeight,
    lineHeight: theme.typography.h4.lineHeight,
    textAlign: 'center',
    width: '120px',
    '&:focus': {
      outline: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: 'white',
    WebkitTextFillColor: 'white',
    cursor: 'not-allowed',
  },
}));

interface BorrowFormProps {
  borrowAmount: string;
  onBorrowChange: (value: string) => void;
  assetToBase: number | undefined;
  collateralRatio: number;
}

const BorrowForm: React.FC<BorrowFormProps> = ({
  borrowAmount,
  onBorrowChange,
  assetToBase,
  collateralRatio,
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

  // Calculate required XLM amount from USDC borrow amount
  const calculateSupplyAmount = (): string => {
    if (!borrowAmount || isNaN(parseFloat(borrowAmount))) {
      return '';
    }
    const baseRate = assetToBase || 1;
    const numValue = parseFloat(borrowAmount);
    // If I want to borrow 1 USDC, I need to supply (1 * collateralRatio/100) / price XLM
    return ((numValue * (collateralRatio / 100)) / baseRate).toFixed(2);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Borrow Input (USDC) */}
      <Box
        sx={{
          width: '45%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <StyledInput
            value={borrowAmount}
            onChange={(e) => handleBorrowChange(e.target.value)}
            placeholder="Amount to borrow"
            type="text"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.]?[0-9]*',
            }}
          />
          <Typography variant="h4" color="white" sx={{ ml: 1 }}>
            USDC
          </Typography>
        </Box>
        <Select
          value="USDC"
          sx={{
            mt: 1,
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
          }}
        >
          <MenuItem value="USDC">USD Coin (USDC)</MenuItem>
        </Select>
      </Box>

      <Box sx={{ color: 'white', fontSize: 24 }}>↔</Box>

      {/* Supply Display (XLM) */}
      <Box
        sx={{
          width: '45%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <StyledInput
            value={calculateSupplyAmount()}
            disabled
            placeholder="Collateral amount"
            type="text"
          />
          <Typography variant="h4" color="white" sx={{ ml: 1 }}>
            XLM
          </Typography>
        </Box>
        <Select
          value="XLM"
          disabled
          sx={{
            mt: 1,
            color: 'white !important',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
          }}
        >
          <MenuItem value="XLM">Supply Amount (XLM)</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default BorrowForm;
