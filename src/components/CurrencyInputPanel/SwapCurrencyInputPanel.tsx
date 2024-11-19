import React, { ReactNode, useCallback, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  styled,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { TokenType } from '../../interfaces';
import { useSorobanReact } from '@soroban-react/core';

// Styled Components
const InputWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  width: '100%',
}));

const CurrencyButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '4px 8px',
  gap: 8,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
  height: 40,
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  fontSize: 24,
  lineHeight: '44px',
  textAlign: 'right',
  width: '100%',
  '& input': {
    textAlign: 'right',
    paddingRight: theme.spacing(1),
    '@media (max-width: 600px)': {
      fontSize: 20,
    },
  },
  '&.Mui-disabled': {
    opacity: 0.4,
  },
}));

const BalanceRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  padding: `${theme.spacing(1)} 0`,
}));

interface SwapCurrencyInputPanelProps {
  value: any;
  onUserInput: (value: string) => void;
  onMax: (maxValue: string) => void;
  showMaxButton: boolean;
  label?: ReactNode;
  onCurrencySelect: (currency: TokenType) => void;
  currency?: TokenType | null;
  hideBalance?: boolean;
  hideInput?: boolean;
  otherCurrency?: TokenType | null;
  fiatValue?: { data?: number; isLoading: boolean };
  priceImpact?: string;
  id: string;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  renderBalance?: (amount: string) => string;
  locked?: boolean;
  loading?: boolean;
  disabled?: boolean;
  disableInput?: boolean;
  networkFees?: number;
  isLoadingNetworkFees?: boolean;
}

const CurrencyLogo = ({ currency, size = '24px' }: { currency: TokenType; size?: string }) => (
  <Box
    component="img"
    src={`/api/placeholder/${parseInt(size)}/${parseInt(size)}`}
    alt={currency.code}
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      marginRight: 1,
    }}
  />
);

export default function SwapCurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  hideInput = false,
  locked = false,
  loading = false,
  disabled = false,
  disableInput = false,
  networkFees,
  isLoadingNetworkFees,
  ...rest
}: SwapCurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { address } = useSorobanReact();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, []);

  const sellOrReceive = id === 'swap-input' ? 'sell' : 'receive';

  const truncateTokenCode = (code: string) => {
    if (code.length > 20) {
      return `${code.slice(0, 4)}...${code.slice(-5)}`;
    }
    return code;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <InputWrapper elevation={0}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          You {sellOrReceive}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <CurrencyButton
            onClick={() => setModalOpen(true)}
            disabled={disabled}
            fullWidth={hideInput}
            data-testid="swap__token__select"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {currency && <CurrencyLogo currency={currency} size={isMobile ? '16px' : '24px'} />}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? 14 : 20,
                  }}
                >
                  {currency ? truncateTokenCode(currency.code) : 'Select token'}
                </Typography>
              </Box>
              <KeyboardArrowDown />
            </Box>
          </CurrencyButton>

          {!hideInput && (
            <StyledInput
              value={value}
              onChange={(e) => onUserInput(e.target.value)}
              disabled={disabled || disableInput}
              placeholder="0.0"
              inputProps={{
                'aria-label': 'amount input',
                'data-testid': `${id}-input-panel`,
              }}
              sx={{
                opacity: loading ? 0.4 : 1,
              }}
            />
          )}
        </Stack>

        {!hideBalance && !hideInput && (
          <BalanceRow>
            <Stack direction="row" spacing={1} alignItems="center">
              {address && currency && (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Balance: 0.0
                  </Typography>
                  {showMaxButton && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => onMax('0')}
                      sx={{ minWidth: 'auto' }}
                    >
                      MAX
                    </Button>
                  )}
                </>
              )}
            </Stack>
            {fiatValue && !fiatValue.isLoading && (
              <Typography variant="body2" color="textSecondary">
                ${fiatValue.data?.toFixed(2)}
              </Typography>
            )}
          </BalanceRow>
        )}
      </InputWrapper>

      <Dialog open={modalOpen} onClose={handleDismissSearch} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select a token
          </Typography>
          {/* Currency search content would go here */}
          <Button onClick={handleDismissSearch}>Close</Button>
        </Box>
      </Dialog>
    </Box>
  );
}
