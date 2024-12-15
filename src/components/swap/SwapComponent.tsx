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

/**
 * Interface defining the props for the SwapComponent
 * @interface SwapComponentProps
 * @property {Partial<SwapState>} [prefilledState] - Optional initial state for the swap
 * @property {boolean} [disableTokenInputs] - Flag to disable token input fields
 * @property {Function} [handleDoSwap] - Optional callback function to handle the swap action
 */
interface SwapComponentProps {
  prefilledState?: Partial<SwapState>;
  disableTokenInputs?: boolean;
  handleDoSwap?: (setSwapState: (value: SetStateAction<SwapStateProps>) => void) => void;
}

/**
 * Interface defining the state properties for the swap operation
 * @interface SwapStateProps
 * @property {boolean} showConfirm - Flag to show confirmation dialog
 * @property {InterfaceTrade} [tradeToConfirm] - Trade details to be confirmed
 * @property {Error} [swapError] - Any error that occurred during the swap
 * @property {any} [swapResult] - Result of the swap operation
 */
interface SwapStateProps {
  showConfirm: boolean;
  tradeToConfirm?: InterfaceTrade;
  swapError?: Error;
  swapResult?: any;
}

// Initial state for the swap operation
const INITIAL_SWAP_STATE: SwapStateProps = {
  showConfirm: false,
  tradeToConfirm: undefined,
  swapError: undefined,
  swapResult: undefined,
};

// Available tokens for swapping
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

/**
 * SwapComponent is a React component that provides a user interface for token swapping functionality.
 * It handles token selection, amount input, price calculations, and swap execution.
 *
 * @component
 * @param {SwapComponentProps} props - Component props
 * @returns {React.ReactElement} A card containing the swap interface
 */
const SwapComponent: React.FC<SwapComponentProps> = ({
  prefilledState = {},
  disableTokenInputs = false,
  handleDoSwap,
}) => {
  // Context and state initialization
  const [txError, setTxError] = useState<boolean>(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string>();

  // Core swap state management
  const [{ showConfirm, tradeToConfirm, swapError, swapResult }, setSwapState] =
    useState<SwapStateProps>(INITIAL_SWAP_STATE);
  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState });
  const { typedValue, independentField } = state;

  // Initialize swap handlers and derive swap state
  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers(dispatch);
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  // Get derived swap information including trade state, balances, and errors
  const {
    trade: { state: tradeState, trade },
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(state);

  /**
   * Memoized calculation of parsed amounts for input and output fields
   */
  const parsedAmounts = useMemo(
    () => ({
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    }),
    [independentField, parsedAmount, trade],
  );

  /**
   * Memoized calculation of decimals for input and output fields
   */
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

  /**
   * Memoized formatting of amounts for display
   */
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: formatTokenAmount(trade?.expectedAmount, decimals[independentField]),
    }),
    [decimals, dependentField, independentField, trade?.expectedAmount, typedValue],
  );

  const {
    tokenBalancesResponse,
    availableNativeBalance,
    isLoading: isLoadingMyBalances,
  } = useGetMyBalances();

  // Initialize with default tokens (XLM and USDC)
  useEffect(() => {
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      const xlmToken = tokens.find((t) => t.code === 'XLM');
      const usdcToken = tokens.find((t) => t.code === 'USDC');
      if (xlmToken && !currencies[Field.INPUT]) {
        onCurrencySelection(Field.INPUT, xlmToken);
      }
      if (usdcToken && !currencies[Field.OUTPUT]) {
        onCurrencySelection(Field.OUTPUT, usdcToken);
      }
    }
  }, []);

  // Function to get balance for a specific token
  const getTokenBalance = useCallback(
    (token: TokenType) => {
      if (!tokenBalancesResponse?.balances) return '0';
      const tokenBalance = tokenBalancesResponse.balances.find(
        (b) => b.contract === token.contract,
      );
      return tokenBalance?.balance || '0';
    },
    [tokenBalancesResponse],
  );

  /**
   * Handles selection of input token
   * @param {TokenType} token - The selected input token
   */
  const handleInputSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.INPUT, token);
    },
    [onCurrencySelection],
  );

  /**
   * Handles selection of output token
   * @param {TokenType} token - The selected output token
   */
  const handleOutputSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.OUTPUT, token);
    },
    [onCurrencySelection],
  );

  /**
   * Handles input amount changes with decimal validation
   * @param {string} value - The input amount value
   */
  const handleTypeInput = useCallback(
    (value: string) => {
      const currency = currencies[Field.INPUT];
      const decimals = currency?.decimals ?? 7;
      if (value.split('.').length > 1 && value.split('.')[1].length > decimals) return;
      onUserInput(Field.INPUT, value);
    },
    [onUserInput, currencies],
  );

  /**
   * Handles output amount changes with decimal validation
   * @param {string} value - The output amount value
   */
  const handleTypeOutput = useCallback(
    (value: string) => {
      const currency = currencies[Field.OUTPUT];
      const decimals = currency?.decimals ?? 7;
      if (value.split('.').length > 1 && value.split('.')[1].length > decimals) return;
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput, currencies],
  );

  // Initialize swap callback
  const { doSwap: swapCallback } = useSwapCallback(trade);

  /**
   * Handles the swap execution with error handling
   */
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

  // Get network fees and button state
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
        borderRadius: '24px',
        minWidth: '480px',
        maxWidth: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardContent sx={{ padding: 3, width: '100%' }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', fontWeight: 400 }}>
            You swap
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', fontWeight: 400 }}>
            to receive
          </Typography>
        </Box>

        {/* Token Selection Section */}
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
                  balance={getTokenBalance(currencies[Field.INPUT] ?? tokens[0]).toString()}
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
                  balance={getTokenBalance(currencies[Field.OUTPUT] ?? tokens[1]).toString()}
                  amount={formattedAmounts[Field.OUTPUT]}
                  onAmountChange={handleTypeOutput}
                  alignment="end"
                  decimals={currencies[Field.OUTPUT]?.decimals ?? 7}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Rate Information Section */}
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
                  <img src="/icons/tokens/xlm.svg" style={{ width: 16, height: 16 }} />
                  <Typography>Fee: {networkFees} XLM</Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Transaction Overview Section */}
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
