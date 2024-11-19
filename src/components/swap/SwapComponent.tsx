import React, {
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import SwapIcon from '../../components/icons/SwapIcon';
import TokenSelection from '../../components/common/TokenSelection';
import { useSorobanReact } from '@soroban-react/core';
import { useSwapCallback } from '../../hooks/useSwapCallback';
import { useDerivedSwapInfo, useSwapActionHandlers } from '../../state/swap/hooks';
import { Field } from '../../state/swap/actions';
import swapReducer, { SwapState, initialState as initialSwapState } from 'state/swap/reducer';
import useSwapNetworkFees from 'hooks/useSwapNetworkFees';
import useSwapMainButton from 'hooks/useSwapMainButton';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { AppContext } from 'contexts';
import { formatTokenAmount } from 'helpers/format';
import { InterfaceTrade } from 'state/types';
import { TokenType } from 'interfaces';

interface SwapComponentProps {
  prefilledState?: Partial<SwapState>;
  disableTokenInputs?: boolean;
  handleDoSwap?: (setSwapState: (value: SetStateAction<SwapStateProps>) => void) => void;
}

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

const tokens: TokenType[] = [
  {
    code: 'XLM',
    contract: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    icon: '/icons/tokens/xlm.svg',
    decimals: 7,
  },
  {
    code: 'USDC',
    contract: 'CAAFIHB4I7WQMJMKC22CZVQNNX7EONWSOMT6SUXK6I3G3F6J4XFRWNDI',
    icon: '/icons/tokens/ousd.svg',
    decimals: 7,
  },
  {
    code: 'SLP',
    contract: 'YOUR_SLP_CONTRACT_ADDRESS',
    icon: '/icons/tokens/slp.svg',
    decimals: 7,
  },
];

const SwapComponent: React.FC<SwapComponentProps> = ({
  prefilledState = {},
  disableTokenInputs = false,
  handleDoSwap,
}) => {
  const sorobanContext = useSorobanReact();
  const { refetch } = useGetMyBalances();
  const { SnackbarContext } = useContext(AppContext);
  const [txError, setTxError] = useState<boolean>(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string>();

  // Core swap state management
  const [{ showConfirm, tradeToConfirm, swapError, swapResult }, setSwapState] =
    useState<SwapStateProps>(INITIAL_SWAP_STATE);
  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState });
  const { typedValue, independentField } = state;

  // Swap handlers and derived state
  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers(dispatch);
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const {
    trade: { state: tradeState, trade },
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(state);

  // Handle amounts and formatting
  const parsedAmounts = useMemo(
    () => ({
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    }),
    [independentField, parsedAmount, trade],
  );

  const decimals = useMemo(
    () => ({
      [Field.INPUT]:
        independentField === Field.INPUT
          ? trade?.outputAmount?.currency.decimals ?? 7
          : trade?.inputAmount?.currency.decimals ?? 7,
      [Field.OUTPUT]:
        independentField === Field.OUTPUT
          ? trade?.inputAmount?.currency.decimals ?? 7
          : trade?.outputAmount?.currency.decimals ?? 7,
    }),
    [independentField, trade],
  );

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: formatTokenAmount(trade?.expectedAmount, decimals[independentField]),
    }),
    [decimals, dependentField, independentField, trade?.expectedAmount, typedValue],
  );

  // Token selection handlers
  const handleInputSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.INPUT, token);
    },
    [onCurrencySelection],
  );

  const handleOutputSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.OUTPUT, token);
    },
    [onCurrencySelection],
  );

  // Amount input handlers
  const handleTypeInput = useCallback(
    (value: string) => {
      const currency = currencies[Field.INPUT];
      const decimals = currency?.decimals ?? 7;
      if (value.split('.').length > 1 && value.split('.')[1].length > decimals) return;
      onUserInput(Field.INPUT, value);
    },
    [onUserInput, currencies],
  );

  const handleTypeOutput = useCallback(
    (value: string) => {
      const currency = currencies[Field.OUTPUT];
      const decimals = currency?.decimals ?? 7;
      if (value.split('.').length > 1 && value.split('.')[1].length > decimals) return;
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput, currencies],
  );

  // Swap execution
  const { doSwap: swapCallback } = useSwapCallback(trade);

  const handleSwap = () => {
    if (handleDoSwap) {
      handleDoSwap(setSwapState);
      return;
    }

    if (!swapCallback) return;

    setSwapState((currentState) => ({
      ...currentState,
      swapError: undefined,
      swapResult: undefined,
    }));

    swapCallback()
      .then((result) => {
        setSwapState((currentState) => ({
          ...currentState,
          swapError: undefined,
          swapResult: result,
        }));
      })
      .catch((error) => {
        console.log(error);
        setTxError(true);
        setTxErrorMessage(error.message);
        setSwapState((currentState) => ({
          ...currentState,
          showConfirm: false,
        }));
      });
  };

  // Network fees and button state
  const { networkFees, isLoading: isLoadingNetworkFees } = useSwapNetworkFees(trade, currencies);
  const { getMainButtonText, isMainButtonDisabled, handleMainButtonClick } = useSwapMainButton({
    currencies,
    currencyBalances,
    formattedAmounts,
    routeNotFound: false,
    onSubmit: handleSwap,
    trade,
    networkFees,
  });

  return (
    <Card
      sx={{
        backgroundColor: '#0A0B0D',
        borderRadius: '24px',
        minWidth: '480px',
        maxWidth: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardContent sx={{ padding: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', fontWeight: 400 }}>
            You swap
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', fontWeight: 400 }}>
            to receive
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
              p: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'start' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={currencies[Field.INPUT] ?? tokens[0]}
                  onTokenSelect={handleInputSelect}
                  //   balance={formatTokenAmount(
                  //     currencyBalances[Field.INPUT],
                  //     currencies[Field.INPUT]?.decimals ?? 7,
                  //   )}
                  balance={'10'}
                  amount={formattedAmounts[Field.INPUT]}
                  onAmountChange={handleTypeInput}
                  alignment="start"
                  decimals={currencies[Field.INPUT]?.decimals ?? 7}
                />
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'end' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={currencies[Field.OUTPUT] ?? tokens[1]}
                  onTokenSelect={handleOutputSelect}
                  //   balance={formatTokenAmount(
                  //     currencyBalances[Field.OUTPUT],
                  //     currencies[Field.OUTPUT]?.decimals ?? 7,
                  //   )}
                  balance={'10'}
                  amount={formattedAmounts[Field.OUTPUT]}
                  onAmountChange={handleTypeOutput}
                  alignment="end"
                  decimals={currencies[Field.OUTPUT]?.decimals ?? 7}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Rate Information */}
        <Box sx={{ mb: 3 }}>
          <Typography align="center" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            Slippage: {trade?.slippageTolerance ?? 3}%
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {trade && (
              <>
                <Typography>
                  1 {currencies[Field.INPUT]?.code} ={' '}
                  {formatTokenAmount(trade.executionPrice, currencies[Field.OUTPUT]?.decimals)}{' '}
                  {currencies[Field.OUTPUT]?.code}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src="/icons/tag.svg" style={{ width: 16, height: 16 }} />
                  <Typography>Fee: {networkFees} XLM</Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Transaction Overview */}
        {formattedAmounts[Field.INPUT] && parseFloat(formattedAmounts[Field.INPUT]) > 0 && (
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              p: 2,
              mb: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '18px', fontWeight: 500, mb: 2 }}>
              Transaction Overview
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>You Swap</Typography>
              <Typography sx={{ color: 'white' }}>
                {formattedAmounts[Field.INPUT]} {currencies[Field.INPUT]?.code}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>You Receive</Typography>
              <Typography sx={{ color: 'white' }}>
                {formattedAmounts[Field.OUTPUT]} {currencies[Field.OUTPUT]?.code}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Network Fee:</Typography>
              <Typography sx={{ color: 'white' }}>{networkFees} XLM</Typography>
            </Box>
            {trade?.priceImpact && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Price Impact:</Typography>
                <Typography sx={{ color: 'white' }}>
                  {/* {formatTokenAmount(trade.priceImpact, 2)}% */}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Submit Transaction Button */}
        <Button
          fullWidth
          disabled={isMainButtonDisabled()}
          onClick={handleMainButtonClick}
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
          {isLoadingNetworkFees ? <CircularProgress size={24} /> : getMainButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SwapComponent;
