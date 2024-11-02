import React, { useState, useEffect, useReducer } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import SwapIcon from '../components/icons/SwapIcon';
import TokenSelection from '../components/common/TokenSelection';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/wallet';
import { useSwapCallback } from '../hooks/useSwapCallback';
import { InterfaceTrade, PlatformType, TradeState } from '../state/routing/types';
import { TradeType } from 'soroswap-router-sdk';
import swapReducer, { SwapState, initialState as initialSwapState } from '../state/swap/reducer';
import { formatTokenAmount, parseUnits } from '../helpers/format';
import { useStore } from '../store/store';
import { TokenType } from 'interfaces';

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
  const router = useRouter();
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
    <StyledCard>
      <CardContent sx={{ padding: 0, width: '100%', pb: '0px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0px !important' }}>
          <Typography gutterBottom color="white" sx={{ padding: '0px 6px', opacity: 0.7 }}>
            You swap
          </Typography>
          <Typography gutterBottom color="white" sx={{ padding: '0px 6px', opacity: 0.7 }}>
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 1 }}>
            Slippage: {calculateSlippage()}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1" color="text.primary">
              1 {toToken.name} = {(1 / 10).toFixed(5)} {fromToken.name}
            </Typography>
            <Typography variant="body1" color="text.primary">
              Price Impact: {calculatePriceImpact()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSwap}
            disabled={isMainButtonDisabled()}
            sx={{
              background: isLoading ? '#83868F' : '#83868F',
              opacity: isLoading ? 0.5 : 1,
              borderRadius: '7px',
              height: '55px',
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : getMainButtonText()}
          </Button>
        </Box>

        <Modal
          open={swapState.showConfirm}
          onClose={handleConfirmDismiss}
          aria-labelledby="confirm-swap-modal"
        >
          <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Typography variant="h6">Confirm Swap</Typography>
            <Typography>
              {fromAmount} {fromToken.name} → {toAmount} {toToken.name}
            </Typography>
            <Typography>Slippage: {calculateSlippage()}</Typography>
            <Typography>Price Impact: {calculatePriceImpact()}</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button onClick={handleConfirmDismiss} variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSwap} variant="contained" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Confirm Swap'}
              </Button>
            </Box>
          </Box>
        </Modal>

        {swapState.swapError && (
          <Modal
            open={Boolean(swapState.swapError)}
            onClose={handleConfirmDismiss}
            aria-labelledby="error-modal"
          >
            <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <Typography variant="h6" color="error">
                Error
              </Typography>
              <Typography>{swapState.swapError.message}</Typography>
              <Button
                onClick={handleConfirmDismiss}
                sx={{ mt: 2 }}
                variant="contained"
                color="error"
              >
                Close
              </Button>
            </Box>
          </Modal>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default Swap;
