import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Box, Button, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { useWallet } from '../contexts/wallet';
import { useHorizonAccount, useTokenBalance } from '../hooks/api';
import TokenSelection from '../components/common/TokenSelection';
import SwapIcon from '../components/icons/SwapIcon';
import { styled } from '@mui/material/styles';
import { xdr, StrKey } from '@stellar/stellar-sdk';

const DECIMALS = 7;
const DECIMAL_MULTIPLIER = 10 ** DECIMALS;
const SLIPPAGE = 1.0; // Fixed 1% slippage

const tokens = [
  {
    code: 'XLM',
    contract: process.env.NEXT_PUBLIC_COLLATERAL_ASSET || '',
    icon: '/icons/tokens/xlm.svg',
    decimals: 7,
  },
  {
    code: 'OUSD',
    contract: process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '',
    icon: '/icons/tokens/ousd.svg',
    decimals: 7,
  }
];

const OverviewItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
      {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
      {label}
    </Typography>
    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>{value}</Typography>
  </Box>
);

const SwapPage: NextPage = () => {
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [pairAddress, setPairAddress] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string>();

  const { connected, walletAddress, swapExactTokensForTokens, routerPairFor, routerGetAmountOut, routerGetAmountIn } = useWallet();
  const { data: horizonAccount } = useHorizonAccount();
  const { data: collateralBalance } = useTokenBalance(tokens[0].contract, undefined, horizonAccount);
  const { data: outputTokenBalance } = useTokenBalance(tokens[1].contract, undefined, horizonAccount);

  const floatToBigInt = (value: string | number): bigint => {
    const multiplier = 10 ** DECIMALS;
    const floatValue = typeof value === 'string' ? parseFloat(value) : value;
    return BigInt(Math.round(floatValue * multiplier));
  };

  const bigIntToFloat = (value: bigint): string => {
    return (Number(value) / DECIMAL_MULTIPLIER).toFixed(DECIMALS);
  };

  useEffect(() => {
    const fetchPairAddress = async () => {
      try {
        const args = {
          token_a: tokens[0].contract,
          token_b: tokens[1].contract,
        };

        const response = await routerPairFor(
          process.env.NEXT_PUBLIC_ROUTER_ID || '',
          args
        );

        if (response?.result?.retval) {
          const retval = response.result.retval;
          if (retval._value?._value instanceof Uint8Array) {
            const contractId = Buffer.from(retval._value._value);
            setPairAddress(StrKey.encodeContract(contractId));
          }
        }
      } catch (error) {
        console.error('Failed to fetch pair address:', error);
      }
    };

    if (connected) {
      fetchPairAddress();
    }
  }, [connected, routerPairFor]);

  const getOutputAmount = async (inputValue: string) => {
    if (!inputValue || isNaN(parseFloat(inputValue)) || !connected) {
      setOutputAmount('');
      return;
    }

    setIsCalculating(true);
    try {
      const args = {
        amount_in: floatToBigInt(inputValue),
        path: [tokens[0].contract, tokens[1].contract],
      };

      const response = await routerGetAmountOut(
        process.env.NEXT_PUBLIC_ROUTER_ID || '',
        args
      );

      if (response?.result?.retval?._value) {
        const outputValue = response.result.retval._value[1];
        if (outputValue?._value?._attributes?.lo?._value) {
          const amount = bigIntToFloat(BigInt(outputValue._value._attributes.lo._value));
          setOutputAmount(amount);
        }
      }
    } catch (error) {
      console.error('Failed to get output amount:', error);
      setOutputAmount('');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    if (value) {
      getOutputAmount(value);
    } else {
      setOutputAmount('');
    }
  };

  const handleSwap = async () => {
    if (!inputAmount || !connected) return;

    try {
      const minOutputAmount = parseFloat(outputAmount) * (1 - SLIPPAGE / 100);

      const args = {
        amount_in: floatToBigInt(inputAmount),
        amount_out_min: floatToBigInt(minOutputAmount),
        path: [tokens[0].contract, tokens[1].contract],
        to: walletAddress,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200), // 20 minutes
      };

      await swapExactTokensForTokens(
        process.env.NEXT_PUBLIC_ROUTER_ID || '',
        args,
        false
      );
    } catch (error) {
      console.error('Swap failed:', error);
      setTxError(true);
      setTxErrorMessage(error.message);
    }
  };

  return (
    <div>
      <div>
        {/* Header */}
        <div className='flex flex-col gap-[7.48px]'>
          <div className='flex justify-between px-2'>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '20px', fontWeight: 400, lineHeight: '24px', fontFamily: 'Satoshi_Variable-Normal, Helvetica' }}>
              You swap
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '20px', fontWeight: 400, lineHeight: '24px', fontFamily: 'Satoshi_Variable-Normal, Helvetica' }}>
              to receive
            </Typography>
          </div>

          {/* Token Selection Section */}
          <Box sx={{ position: 'relative', display: 'flex', minWidth: '629.63px' }}>
            {/* <SwapIcon /> */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
              <TokenSelection
                tokens={tokens}
                selectedToken={tokens[0]}
                onTokenSelect={() => { }}
                balance={collateralBalance?.toString()}
                amount={inputAmount}
                onAmountChange={handleInputChange}
                alignment="start"
                decimals={7}
              />
            </Box>
            <Box sx={{ width: '100%' }}>
              <TokenSelection
                tokens={tokens}
                selectedToken={tokens[1]}
                onTokenSelect={() => { }}
                balance={outputTokenBalance?.toString()}
                amount={outputAmount}
                onAmountChange={() => { }}
                alignment="end"
                decimals={7}
              />
            </Box>
          </Box>

          <p className='text-center'>
            Slippage: 3%
          </p>
        </div>

        {/* Transaction Overview */}
        {inputAmount && outputAmount && (
          <Box
            sx={{
              p: 3,
              color: 'white',
              background: 'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
              borderRadius: '16px',
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" align="center" gutterBottom>
              Transaction Overview
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Swap Details
                </Typography>
                <OverviewItem
                  label="You Swap:"
                  value={`${inputAmount} ${tokens[0].code}`}
                />
                <OverviewItem
                  label="You Receive:"
                  value={`${outputAmount} ${tokens[1].code}`}
                />
                <OverviewItem
                  label="Minimum Received:"
                  value={`${(parseFloat(outputAmount) * (1 - SLIPPAGE / 100)).toFixed(7)} ${tokens[1].code}`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Network Details
                </Typography>
                <OverviewItem
                  label="Rate:"
                  value={`1 ${tokens[0].code} = ${(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(7)} ${tokens[1].code}`}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </div>

      <div>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSwap}
          disabled={!connected || !inputAmount || parseFloat(inputAmount) <= 0 || isCalculating}
          sx={{
            backgroundColor: '#2050F2',
            height: '62.96px',
            color: 'white',
            marginTop: '7.92px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            '&:disabled': {
              backgroundColor: '#1a2847',
              color: 'rgba(255, 255, 255, 0.3)',
              cursor: 'not-allowed',
            },
          }}
        >
          {'Submit Transaction'}
        </Button>

        {txError && (
          <Typography color="error" align="center" sx={{ mt: 2, marginTop: '7.92px', }}>
            {txErrorMessage}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default SwapPage;