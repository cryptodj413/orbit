import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import SwapIcon from '../components/icons/SwapIcon';
import TokenSelection from '../components/common/TokenSelection';
import { NextPage } from 'next';

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
}));

const tokens = [
  { name: 'XLM', icon: '/icons/tokens/xlm.svg' },
  { name: 'oUSD', icon: '/icons/tokens/ousd.svg' },
  { name: 'SLP', icon: '/icons/tokens/slp.svg' },
];

const CONVERSION_RATE = 0.5; // Example conversion rate

const Swap: NextPage = () => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromBalance, setFromBalance] = useState('102.72');
  const [toBalance, setToBalance] = useState('26,015');
  const [fromAmount, setFromAmount] = useState('0.0');
  const [toAmount, setToAmount] = useState('0.0');

  useEffect(() => {
    const newToAmount = (parseFloat(fromAmount) * CONVERSION_RATE).toFixed(1);
    setToAmount(newToAmount);
  }, [fromAmount]);

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    const newToAmount = (parseFloat(amount) * CONVERSION_RATE).toFixed(1);
    setToAmount(newToAmount);
  };

  const handleToAmountChange = (amount: string) => {
    setToAmount(amount);
    const newFromAmount = (parseFloat(amount) / CONVERSION_RATE).toFixed(1);
    setFromAmount(newFromAmount);
  };

  return (
    <>
      <CardContent sx={{ padding: 0, width: '100%', pb: '0px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0px !important' }}>
          <Typography
            variant="p"
            gutterBottom
            color="white"
            sx={{ padding: '0px 6px', opacity: 0.7 }}
          >
            You swap
          </Typography>
          <Typography
            variant="p"
            gutterBottom
            color="white"
            sx={{ padding: '0px 6px', opacity: 0.7 }}
          >
            To receive
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <SwapIcon />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'start' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={fromToken}
                  onTokenSelect={setFromToken}
                  balance={fromBalance}
                  amount={fromAmount}
                  onAmountChange={handleFromAmountChange}
                  alignment="start"
                />
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'end' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={toToken}
                  onTokenSelect={setToToken}
                  balance={toBalance}
                  amount={toAmount}
                  onAmountChange={handleToAmountChange}
                  alignment="end"
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 1 }}>
            Slippage: 3%
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1" color="text.primary">
              1 oUSD = 0.09214 XLM
            </Typography>
            <Typography variant="body1" color="text.primary">
              0.5% = 154.12 XLM
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.32)',
              borderRadius: '7px',
              height: '55px',
              color: 'white',
            }}
          >
            Advanced Options
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              background: '#83868F',
              opacity: 0.5,
              borderRadius: '7px',
              height: '55px',
            }}
          >
            Submit Transaction
          </Button>
        </Box>
      </CardContent>
    </>
  );
};

export default Swap;
