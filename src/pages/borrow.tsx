// pages/Borrow.tsx
import React from 'react';
import { NextPage } from 'next';
import { Box, Button, Grid, Typography } from '@mui/material';
import BorrowCard from '../components/borrow/BorrowCard';
import BorrowForm from '../components/borrow/BorrowForm';
import CollateralRatioSlider from '../components/borrow/CollateralRatioSlider';
import TransactionOverview from '../components/borrow/TransactionOverview';
import StyledGrid from '../components/common/StyledGrid';

const Borrow: NextPage = () => {
  const [collateralRatio, setCollateralRatio] = React.useState<number>(200);
  const [xlmAmount, setXlmAmount] = React.useState<string>('');
  const [oUsdAmount, setOUsdAmount] = React.useState<string>('');
  const conversionRate = 0.005481; // 1 XLM = 0.005481 oUSD

  const handleCollateralRatioChange = (newValue: number) => {
    setCollateralRatio(newValue);
  };

  const handleXlmChange = (value: string) => {
    setXlmAmount(value);
    setOUsdAmount((parseFloat(value || '0') * conversionRate).toFixed(2));
  };

  const handleOUsdChange = (value: string) => {
    setOUsdAmount(value);
    setXlmAmount((parseFloat(value || '0') / conversionRate).toFixed(2));
  };

  const isAmountFilled = xlmAmount !== '' && oUsdAmount !== '';

  return (
    <>
      <StyledGrid>
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
          <BorrowForm
            xlmAmount={xlmAmount}
            oUsdAmount={oUsdAmount}
            onXlmChange={handleXlmChange}
            onOUsdChange={handleOUsdChange}
          />
        </Grid>

        {/* Third row */}
        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <CollateralRatioSlider value={collateralRatio} onChange={handleCollateralRatioChange} />
        </Grid>

        {/* Fourth row */}
        {isAmountFilled && (
          <Grid item xs={12} sx={{ padding: '0px !important' }}>
            <TransactionOverview
              xlmAmount={xlmAmount}
              oUsdAmount={oUsdAmount}
              collateralRatio={collateralRatio}
            />
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
    </>
  );
};

export default Borrow;
