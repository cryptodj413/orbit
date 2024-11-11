import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Modal,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SwapIcon from '../components/icons/SwapIcon';
import TokenSelection from '../components/common/TokenSelection';
import { NextPage } from 'next';
import { useWallet } from '../contexts/wallet';
import { useSwapCallback } from '../hooks/useSwapCallback';
import { InterfaceTrade, PlatformType, TradeState } from '../state/routing/types';
import { TradeType } from 'soroswap-router-sdk';
import { formatTokenAmount, parseUnits } from '../helpers/format';
import { useStore } from '../store/store';

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
}));

const tokens = [
  { name: 'XLM', icon: '/icons/tokens/xlm.svg', decimals: 7 },
  { name: 'USDC', icon: '/icons/tokens/ousd.svg', decimals: 7 },
  { name: 'SLP', icon: '/icons/tokens/slp.svg', decimals: 7 },
];

interface SwapStateProps {
  showConfirm: boolean;
  tradeToConfirm?: InterfaceTrade;
  swapError?: Error;
  swapResult?: any;
}

const INITIAL_SWAP_STATE: SwapStateProps = {
  showConfirm: false,
  tradeToConfirm: undefined,
  swapError: undefined,
  swapResult: undefined,
};

const TOKENS = {
  XLM: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  USDC: 'CAAFIHB4I7WQMJMKC22CZVQNNX7EONWSOMT6SUXK6I3G3F6J4XFRWNDI',
};

const Swap: NextPage = () => {
  const theme = useTheme();
  const { connected, walletAddress } = useWallet();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromBalance, setFromBalance] = useState('100000000000');
  const [toBalance, setToBalance] = useState('1000000000');
  const [fromAmount, setFromAmount] = useState('0.0');
  const [toAmount, setToAmount] = useState('0.0');
  const [isLoading, setIsLoading] = useState(false);
  const [tradeState, setTradeState] = useState<TradeState>(TradeState.INVALID);
  const [swapState, setSwapState] = useState<SwapStateProps>(INITIAL_SWAP_STATE);
  const poolData = useStore((state) =>
    state.pools.get('CCEVW3EEW4GRUZTZRTAMJAXD6XIF5IG7YQJMEEMKMVVGFPESTRXY2ZAV'),
  );
  const reserve = poolData?.reserves.get(TOKENS['USDC']);
  const reserve_xlm = poolData?.reserves.get(TOKENS['XLM']);
  const assetToXlm = reserve_xlm?.oraclePrice ?? 1;

  // Add validation state
  const [inputError, setInputError] = useState<string | undefined>();
  const [needsTrustline, setNeedsTrustline] = useState(false);

  const getScaledAmount = (amount: string, decimals: number): string => {
    try {
      return parseUnits(amount || '0', decimals).toString();
    } catch {
      return '0';
    }
  };
  const trade: InterfaceTrade = {
    tradeType: TradeType.EXACT_INPUT,
    inputAmount: {
      value: '1000000000',
      currency: {
        name: 'Stellar Lumens',
        contract: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        code: 'XLM',
        icon: 'https://assets.coingecko.com/coins/images/100/standard/Stellar_symbol_black_RGB.png',
        decimals: 7,
      },
    },
    outputAmount: {
      value: '10310964',
      currency: {
        name: 'USDCoin',
        contract: 'CAAFIHB4I7WQMJMKC22CZVQNNX7EONWSOMT6SUXK6I3G3F6J4XFRWNDI',
        code: 'USDC',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        decimals: 7,
      },
    },
    path: [
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      'CAAFIHB4I7WQMJMKC22CZVQNNX7EONWSOMT6SUXK6I3G3F6J4XFRWNDI',
    ],
    platform: PlatformType.ROUTER,
  };

  const { doSwap } = useSwapCallback(trade);

  useEffect(() => {
    validateTrade();
  }, [fromAmount, toAmount, fromToken, toToken]);

  const validateTrade = () => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setInputError('Enter an amount');
      setTradeState(TradeState.INVALID);
      return;
    }

    const scaledFromBalance = formatTokenAmount(fromBalance, fromToken.decimals);
    if (parseFloat(fromAmount) > parseFloat(scaledFromBalance)) {
      setInputError('Insufficient balance');
      setTradeState(TradeState.INVALID);
      return;
    }

    setInputError(undefined);
    setTradeState(TradeState.VALID);
  };

  const handleFromAmountChange = (amount: string) => {
    if (amount === '' || /^\d*\.?\d*$/.test(amount)) {
      setFromAmount(amount);
      const newToAmount = calculateToAmount(amount);
      setToAmount(newToAmount);
    }
  };

  const handleToAmountChange = (amount: string) => {
    if (amount === '' || /^\d*\.?\d*$/.test(amount)) {
      setToAmount(amount);
      const newFromAmount = calculateFromAmount(amount);
      setFromAmount(newFromAmount);
    }
  };

  const calculateToAmount = (amount: string): string => {
    // Replace with actual price calculation logic
    const CONVERSION_RATE = 0.010310964;
    return amount ? (parseFloat(amount) * CONVERSION_RATE).toFixed(toToken.decimals) : '0.0';
  };

  const calculateFromAmount = (amount: string): string => {
    // Replace with actual price calculation logic
    const CONVERSION_RATE = 0.010310964;
    return amount ? (parseFloat(amount) / CONVERSION_RATE).toFixed(fromToken.decimals) : '0.0';
  };

  const handleSwap = async () => {
    if (!doSwap || tradeState !== TradeState.VALID) return;
    console.log(assetToXlm);
    setIsLoading(true);
    setSwapState({
      ...swapState,
      tradeToConfirm: trade,
      showConfirm: true,
    });

    try {
      const result = await doSwap();
      setSwapState({
        showConfirm: false,
        swapResult: result,
        swapError: undefined,
        tradeToConfirm: undefined,
      });
      // Reset form
      setFromAmount('0.0');
      setToAmount('0.0');
    } catch (error: any) {
      setSwapState({
        ...swapState,
        swapError: error,
        showConfirm: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDismiss = () => {
    setSwapState({
      ...INITIAL_SWAP_STATE,
    });
  };

  const calculateSlippage = () => {
    // Implement actual slippage calculation
    return '0.5%';
  };

  const calculatePriceImpact = () => {
    // Implement actual price impact calculation
    return '0.1%';
  };

  const getMainButtonText = () => {
    if (!connected) return 'Connect Wallet';
    if (needsTrustline) return 'Set Trustline';
    if (inputError) return inputError;
    if (isLoading) return 'Loading...';
    if (tradeState === TradeState.NO_ROUTE_FOUND) return 'No Route Found';
    if (tradeState === TradeState.INVALID) return 'Enter an Amount';
    return 'Swap';
  };

  const isMainButtonDisabled = () => {
    return (
      !connected ||
      isLoading ||
      Boolean(inputError) ||
      tradeState !== TradeState.VALID ||
      parseFloat(fromAmount) === 0
    );
  };

  return (
    <Card
      sx={{
        backgroundColor: '#0A0B0D', // Dark background
        borderRadius: '24px',
        minWidth: '480px',
        maxWidth: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardContent sx={{ padding: theme.spacing(3), width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: 400,
            }}
          >
            You swap
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: 400,
            }}
          >
            to receive
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', mb: theme.spacing(2) }}>
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
              p: theme.spacing(2),
            }}
          >
            <Grid container spacing={theme.spacing(2)}>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'start' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={fromToken}
                  onTokenSelect={setFromToken}
                  balance={formatTokenAmount(fromBalance, fromToken.decimals)}
                  amount={fromAmount}
                  onAmountChange={handleFromAmountChange}
                  alignment="start"
                  decimals={fromToken.decimals}
                />
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'end' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={toToken}
                  onTokenSelect={setToToken}
                  balance={formatTokenAmount(toBalance, toToken.decimals)}
                  amount={toAmount}
                  onAmountChange={handleToAmountChange}
                  alignment="end"
                  decimals={toToken.decimals}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Slippage and Rate Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            align="center"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 2,
            }}
          >
            Slippage: 3%
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <Typography>1 oUSD = 0.09214 XLM</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src="/icons/tag.svg" style={{ width: 16, height: 16 }} />
              <Typography>0.5% = 154.12 XLM</Typography>
            </Box>
          </Box>
        </Box>

        {/* Transaction Overview */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              p: 2,
              mb: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              sx={{
                color: 'white',
                fontSize: '18px',
                fontWeight: 500,
                mb: 2,
              }}
            >
              Transaction Overview
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>You Swap</Typography>
              <Typography sx={{ color: 'white' }}>{fromAmount} oUSD</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>You Receive</Typography>
              <Typography sx={{ color: 'white' }}>{toAmount} XLM</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Gas:</Typography>
              <Typography sx={{ color: 'white' }}>0.03 XLM</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Platform Fee:</Typography>
              <Typography sx={{ color: 'white' }}>0.5%</Typography>
            </Box>
          </Box>
        )}

        {/* Advanced Options Button */}
        <Button
          fullWidth
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            mb: 2,
            py: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Advanced Options
        </Button>

        {/* Submit Transaction Button */}
        <Button
          fullWidth
          disabled={isMainButtonDisabled()}
          onClick={handleSwap}
          sx={{
            backgroundColor: isMainButtonDisabled() ? 'rgba(255, 255, 255, 0.1)' : '#0215D3',
            color: 'white',
            borderRadius: '16px',
            py: 2,
            fontSize: '16px',
            '&:hover': {
              backgroundColor: isMainButtonDisabled() ? 'rgba(255, 255, 255, 0.1)' : '#0313A9',
            },
            '&:disabled': {
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : getMainButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Swap;
