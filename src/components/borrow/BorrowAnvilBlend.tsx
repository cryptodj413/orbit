import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Slider,
  Select,
  MenuItem,
  InputBase,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#030615',
  borderRadius: '25px',
  overflow: 'hidden',
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& > .MuiGrid-item': {
    borderRight: '1px solid rgba(255, 255, 255, 0.32)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.32)',
    padding: theme.spacing(2),
    '&:last-child': {
      borderRight: 'none',
    },
  },
  '& > .MuiGrid-item:nth-of-type(3)': {
    borderRight: 'none',
  },
  '& > .MuiGrid-item:nth-last-of-type(-n+3):not(:nth-of-type(1), :nth-of-type(2), :nth-of-type(3))':
    {
      borderBottom: 'none',
    },
  borderRadius: '17px',
  border: '1px solid rgba(255, 255, 255, 0.32)',
}));

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
    '&:focus': {
      outline: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '&[type=number]': {
      '-moz-appearance': 'textfield',
    },
  },
}));

const DynamicWidthInput = ({ value, onChange, placeholder }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      const minWidth = 30; // Minimum width for the input
      const valueWidth = value.length * 20; // Approximate width per character
      const newWidth = Math.max(minWidth, valueWidth);
      inputRef.current.style.width = `${newWidth}px`;
    }
  }, [value]);

  return (
    <StyledInput
      inputRef={inputRef}
      value={value}
      onChange={onChange}
      type="number"
      placeholder={placeholder}
    />
  );
};

const BorrowAnvil: React.FC = () => {
  const [collateralRatio, setCollateralRatio] = useState<number>(200);
  const [xlmAmount, setXlmAmount] = useState<string>('');
  const [oUsdAmount, setOUsdAmount] = useState<string>('');
  const conversionRate = 0.005481; // 1 XLM = 0.005481 oUSD

  const handleCollateralRatioChange = (event: Event, newValue: number | number[]) => {
    setCollateralRatio(newValue as number);
  };

  const handleXlmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setXlmAmount(value);
    setOUsdAmount((parseFloat(value || '0') * conversionRate).toFixed(2));
  };

  const handleOUsdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOUsdAmount(value);
    setXlmAmount((parseFloat(value || '0') / conversionRate).toFixed(2));
  };

  const isAmountFilled = xlmAmount !== '' && oUsdAmount !== '';

  return (
    <StyledCard sx={{ display: 'flex', width: '680px', background: '#030615', p: 4, pb: 0 }}>
      <CardContent sx={{ p: 0 }}>
        <StyledGrid container>
          {/* First row */}
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography variant="subtitle2">Borrow APY</Typography>
              <Typography variant="h6">4.00%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography variant="subtitle2">Liability Factor</Typography>
              <Typography variant="h6">100.00%</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography variant="subtitle2">Total Borrowed</Typography>
              <Typography variant="h6">2.1k</Typography>
            </Box>
          </Grid>

          {/* Second row */}
          <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* XLM side */}
              <Box
                sx={{
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                  <DynamicWidthInput value={xlmAmount} onChange={handleXlmChange} placeholder="0" />
                  <Typography variant="h4" color="white" sx={{ ml: 1 }}>
                    XLM
                  </Typography>
                </Box>
                <Select
                  value="XLM"
                  sx={{
                    mt: 1,
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                  }}
                >
                  <MenuItem value="XLM">Stellar Lumen (XLM)</MenuItem>
                </Select>
              </Box>

              <Box sx={{ color: 'white', fontSize: 24 }}>↔</Box>

              {/* oUSD side */}
              <Box
                sx={{
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                  <DynamicWidthInput
                    value={oUsdAmount}
                    onChange={handleOUsdChange}
                    placeholder="0"
                  />
                  <Typography variant="h4" color="white" sx={{ ml: 1 }}>
                    oUSD
                  </Typography>
                </Box>
                <Select
                  value="oUSD"
                  sx={{
                    mt: 1,
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                  }}
                >
                  <MenuItem value="oUSD">Orbital Dollar (oUSD)</MenuItem>
                </Select>
              </Box>
            </Box>
          </Grid>

          {/* Third row - Collateral Ratio Slider */}
          <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
            <Typography variant="subtitle1" color="white">
              Collateral Ratio
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Slider
                value={collateralRatio}
                onChange={handleCollateralRatioChange}
                aria-labelledby="collateral-ratio-slider"
                valueLabelDisplay="auto"
                step={1}
                marks={[
                  { value: 135, label: '135%' },
                  { value: 200, label: '200%' },
                  { value: 250, label: '250%' },
                  { value: 300, label: '300%' },
                ]}
                min={135}
                max={300}
                sx={{
                  color: '#96FD02',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#96FD02',
                    width: 16,
                    height: 16,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#96FD02',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#797979',
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: '#96FD02',
                    opacity: 0.4,
                  },
                  '& .MuiSlider-markActive': {
                    backgroundColor: '#96FD02',
                    opacity: 0.4,
                  },
                  width: '95%',
                }}
              />
            </Box>
          </Grid>

          {/* Fourth row - Transaction Overview */}
          {isAmountFilled && (
            <Grid
              item
              xs={12}
              sx={{
                background:
                  'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  color: 'white',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Transaction Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Collateral Details</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Deposit:</Typography>
                      <Typography variant="body2">{xlmAmount} XLM</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Deposit Value:</Typography>
                      <Typography variant="body2">
                        ${(parseFloat(xlmAmount || '0') * 0.08988).toFixed(2)} USD
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Collateral Ratio:</Typography>
                      <Typography variant="body2">{collateralRatio}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Max Borrow:</Typography>
                      <Typography variant="body2">
                        {(parseFloat(oUsdAmount || '0') * 2).toFixed(2)} oUSD
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Repayment and Fees</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Amount to repay:</Typography>
                      <Typography variant="body2">
                        {(parseFloat(oUsdAmount || '0') * 1.04).toFixed(2)} oUSD
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Gas:</Typography>
                      <Typography variant="body2">0.03 XLM</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </StyledGrid>
        <Button
          variant="contained"
          fullWidth
          disabled={!isAmountFilled}
          sx={{
            mt: 2,
            padding: '16px 8px',
            background: '#2050F2',
            color: 'white',
            '&:hover': {
              background: '#1565c0',
            },
            '&:disabled': {
              background: '#1a2847',
              color: 'rgba(255, 255, 255, 0.3)',
            },
            borderRadius: '7px',
          }}
        >
          Submit Transaction
        </Button>
      </CardContent>
    </StyledCard>
  );
};

export default BorrowAnvil;
