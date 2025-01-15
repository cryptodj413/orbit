import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress } from '@mui/material';
import SwapIcon from '../../components/icons/SwapIcon';
import TokenSelection from '../../components/common/TokenSelection';
import { formatTokenAmount } from '../../helpers/format';
import { TokenType } from '../../interfaces';
import { useHorizonAccount, useTokenBalance } from '../../hooks/api';

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

const GasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 17H19V10C19 9.73478 18.8946 9.48043 18.7071 9.29289C18.5196 9.10536 18.2652 9 18 9H16C15.7348 9 15.4804 9.10536 15.2929 9.29289C15.1054 9.48043 15 9.73478 15 10V17H2C1.73478 17 1.48043 17.1054 1.29289 17.2929C1.10536 17.4804 1 17.7348 1 18V21C1 21.2652 1.10536 21.5196 1.29289 21.7071C1.48043 21.8946 1.73478 22 2 22H22C22.2652 22 22.5196 21.8946 22.7071 21.7071C22.8946 21.5196 23 21.2652 23 21V18C23 17.7348 22.8946 17.4804 22.7071 17.2929C22.5196 17.1054 22.2652 17 22 17ZM13 5V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2H4C3.73478 2 3.48043 2.10536 3.29289 2.29289C3.10536 2.48043 3 2.73478 3 3V15H13V5Z"
      fill="currentColor"
    />
  </svg>
);

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
  swapError?: Error;
  swapResult?: any;
}

// Initial state for the swap operation
const INITIAL_SWAP_STATE: SwapStateProps = {
  showConfirm: false,
  swapError: undefined,
  swapResult: undefined,
};

// Available tokens for swapping
const tokens: TokenType[] = [
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
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');

  const { data: horizonAccount } = useHorizonAccount();
  const collateral = process.env.NEXT_PUBLIC_COLLATERAL_ASSET || null;
  const stablecoin = process.env.NEXT_PUBLIC_STABLECOIN_ASSET || null;

  const { data: collateralBalance } = useTokenBalance(
    collateral,
    undefined,
    horizonAccount
  )
  const { data: stablecoinBalance } = useTokenBalance(
    stablecoin,
    undefined,
    horizonAccount
  )

  // Core swap state management
  const [{ showConfirm, swapError, swapResult }, setSwapState] =
    useState<SwapStateProps>(INITIAL_SWAP_STATE);

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
                  selectedToken={tokens[0]}
                  onTokenSelect={handleInputSelect}
                  balance={collateralBalance?.toString()}
                  amount={formattedAmounts[Field.INPUT]}
                  onAmountChange={handleTypeInput}
                  alignment="start"
                  decimals={7}
                />
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'end' }}>
                <TokenSelection
                  tokens={tokens}
                  selectedToken={tokens[1]}
                  onTokenSelect={handleOutputSelect}
                  balance={stablecoinBalance?.toString()}
                  amount={formattedAmounts[Field.OUTPUT]}
                  onAmountChange={handleTypeOutput}
                  alignment="end"
                  decimals={7}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Rate Information Section */}
        <Box sx={{ mb: 3 }}>
          <Typography align="center" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            Slippage: {3}%
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
              p: 3,
              color: 'white',
              background:
                'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
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
                  value={`${formattedAmounts[Field.INPUT]} ${currencies[Field.INPUT]?.code}`}
                />
                <OverviewItem
                  label="You Receive:"
                  value={`${formattedAmounts[Field.OUTPUT]} ${currencies[Field.OUTPUT]?.code}`}
                />
                {trade?.priceImpact && (
                  <OverviewItem label="Price Impact:" value={`${trade.priceImpact.toFixed(2)}%`} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Network Details
                </Typography>
                <OverviewItem
                  label="Network Fee:"
                  value={`${networkFees} XLM`}
                  icon={<GasIcon />}
                />
                <OverviewItem
                  label="Rate:"
                  value={`1 ${currencies[Field.INPUT]?.code} = ${formatTokenAmount(
                    trade?.executionPrice,
                    currencies[Field.OUTPUT]?.decimals,
                  )} ${currencies[Field.OUTPUT]?.code}`}
                />
              </Grid>
            </Grid>
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
