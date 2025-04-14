import React from 'react';
import Image from 'next/image';
import { Box, Typography, Select, MenuItem, InputBase, TextField } from '@mui/material';
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
    if (value === '') {
      onBorrowChange('');
      return;
    }

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
          {/* <TextField
            value={collateralAmount}
            onChange={(e) => handleBorrowChange(e.target.value)}
            placeholder="0.00"
            type="text"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.]?[0-9]*',
            }}
          /> */}
          <TextField
            value={collateralAmount}
            onChange={(e) => handleBorrowChange(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              style: { fontSize: '2.125rem', fontWeight: 700 },
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontWeight: 700,
              },
              input: {
                color: 'white',
                lineHeight: '41.35px',
                letterSpacing: '3px',
                fontWeight: '500 !important'
              },
              width: '100%',
            }}
            placeholder="0.0"
          />
          <Typography color="white" sx={{ ml: 1, fontSize: '30px', fontWeight: 500 }}>
            XLM
          </Typography>
        </Box>
        <Select
          value="XLM"
          IconComponent={() => null}
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
              <Image src={XlmIcon.src} width={18} height={18} alt="oUSD" />
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
            <Image src={XlmIcon.src} width={18} height={18} alt="XLM" />
            <Typography>Stellar Lumen (XLM)</Typography>
          </MenuItem>
        </Select>
      </Box>

      <Box sx={{ color: 'white', fontSize: 24 }}>
        <Image src={Icon.src} width={Icon.width} height={Icon.height} alt="Icon" />
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
          IconComponent={() => null}
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
              <Image src={OusdIcon.src} width={18} height={18} alt="oUSD" />
              <Typography>
                Orbital Dollar (oUSD)
                <KeyboardArrowDownIcon />
              </Typography>
            </Box>
          )}
        >
          <MenuItem value="oUSD" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Image src={OusdIcon.src} width={18} height={18} alt="oUSD" />
            <Typography>Orbital Dollar (oUSD)</Typography>
          </MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default BorrowForm;
