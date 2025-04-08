import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import { Box, Button, Typography, Grid } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import { StrKey, Asset, rpc } from '@stellar/stellar-sdk';
import { useHorizonAccount, useTokenBalance } from '../hooks/api';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../hooks/debounce';
import TokenSelection from '../components/common/TokenSelection';
import { TokenType } from '../interfaces/tokens';
import { useWallet, TxStatus } from '../contexts/wallet';
import { toBalance, bigIntToFloat, floatToBigInt } from '../utils/formatter';
import { BLND_ASSET, OUSD_ASSET } from '../utils/token_display';
import { requiresTrustline } from '../utils/horizon';
import swapBackground from '../../public/background/swapBackground.svg';
import {
  NEXT_PUBLIC_COLLATERAL_ASSET,
  NEXT_PUBLIC_STABLECOIN_ASSET,
  NEXT_PUBLIC_ROUTER_ID,
} from '../config/constants';

const SLIPPAGE = 1.0; // Fixed 1% slippage

const tokens = [
  {
    code: 'XLM',
    contract: NEXT_PUBLIC_COLLATERAL_ASSET || '',
    icon: '/icons/tokens/xlm.svg',
    decimals: 7,
    asset: new Asset('XLM', 'GAXHVI4RI4KFLWWEZSUNLDKMQSKHRBCFB44FNUZDOGSJODVX5GAAKOMX'),
  },
  {
    code: 'oUSD',
    contract: NEXT_PUBLIC_STABLECOIN_ASSET || '',
    icon: '/icons/tokens/ousd.svg',
    decimals: 7,
    asset: new Asset('OUSD', 'GCAA2HBEFR7JWYZAVZ4HRZRMT3P6EVGI63HPUCSWIT37AMNXGJ5IKFXW'),
  },
];

const OverviewItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactElement;
}) => {
  const [first, setFirst] = useState<boolean>(true);

  useEffect(() => {
    setFirst(false);
  }, []);


  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
        {!first && icon && (
          <Box component="span" sx={{ mr: 1 }}>
            {icon}
          </Box>
        )}
        {label}
      </Typography>
      <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
};

const SwapPage: NextPage = () => {
  const [simResponse, setSimResponse] = useState<rpc.Api.SimulateTransactionResponse | undefined>(
    undefined,
  );
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [outputAmount, setOutputAmount] = useState<string>('0');
  const [exchageRate, setExchangeRate] = useState<string>('0');
  const [selectedInputToken, setSelectedInputToken] = useState<TokenType>(tokens[0]);
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenType>(tokens[1]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string>();

  const {
    connected,
    walletAddress,
    txType,
    swapExactTokensForTokens,
    routerGetAmountOut,
    setTxStatus,
    createTrustlines
  } = useWallet();

  const { data: account, data: horizonAccount, refetch: refechAccount } = useHorizonAccount();
  const hasTrustline = !requiresTrustline(account, BLND_ASSET) && !requiresTrustline(account, OUSD_ASSET);

  const { data: inputTokenBalance } = useTokenBalance(
    selectedInputToken.contract,
    selectedInputToken.asset,
    horizonAccount,
  );
  const { data: outputTokenBalance } = useTokenBalance(
    selectedOutputToken.contract,
    selectedOutputToken.asset,
    horizonAccount,
  );

  useEffect(() => {
    getOutputAmount(inputAmount);
  }, [selectedInputToken, selectedOutputToken]);

  const getOutputAmount = async (inputValue: string) => {
    if (!inputValue || isNaN(parseFloat(inputValue)) || !connected || parseFloat(inputValue) <= 0) {
      setOutputAmount('');
      return;
    }
    setIsCalculating(true);
    try {
      if (selectedInputToken.code === selectedOutputToken.code) {
        setOutputAmount(inputValue);
        setExchangeRate('1');
        return;
      }

      const args = {
        amount_in: floatToBigInt(inputValue),
        path: [selectedInputToken.contract, selectedOutputToken.contract],
      };

      const response = await routerGetAmountOut(NEXT_PUBLIC_ROUTER_ID || '', args);

      if ('result' in response && response.result && 'retval' in response.result) {
        const retval = response.result.retval;

        if ('_value' in retval && Array.isArray(retval._value)) {
          const outputValue = retval._value[1];

          if (outputValue && '_value' in outputValue && '_attributes' in outputValue._value) {
            const attributes = outputValue._value._attributes;

            if ('lo' in attributes && '_value' in attributes.lo) {
              const amount = bigIntToFloat(BigInt(attributes.lo._value));
              setOutputAmount(amount);

              const rate = Number(amount) / Number(inputValue);
              setExchangeRate(String(rate));
            }
          }
        }
      } else {
        console.error('Response structure is unexpected:', response);
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

  const handleSwap = async (
    sim: boolean,
  ): Promise<rpc.Api.SimulateTransactionResponse | undefined> => {
    if (inputAmount && outputAmount && walletAddress && connected) {
      if (!sim) {
        setTxStatus(TxStatus.SUBMITTING);
      }
      try {
        const minOutputAmount = parseFloat(outputAmount) * (1 - SLIPPAGE / 100);
        const args = {
          amount_in: floatToBigInt(inputAmount),
          amount_out_min: floatToBigInt(minOutputAmount),
          path: [selectedInputToken.contract, selectedOutputToken.contract],
          to: walletAddress,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 1200), // 20 minutes
        };

        const result = await swapExactTokensForTokens(NEXT_PUBLIC_ROUTER_ID || '', args, sim);
        return result;
      } catch (error) {
        console.error('Swap failed:', error);
        setTxError(true);
        setTxErrorMessage(error.message);
        return undefined;
      }
    }
    return undefined;
  };

  useDebouncedState(inputAmount, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    let response = await handleSwap(true);
    if (response !== undefined) {
      setSimResponse(response);
    }
  });

  async function handleCreateTrustlineClick() {
    if (connected) {
      await createTrustlines([BLND_ASSET, OUSD_ASSET]);
      refechAccount();
    }
  }

  const handleClick = () => {
    if(hasTrustline) {
      handleSwap(false)
    } else {
      handleCreateTrustlineClick()
    }
  }

  return (
    <div className="mix-blend-normal isolate">
      <div>
        <div className="flex flex-col gap-[7.48px]">
          <div className="flex justify-between px-2">
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '20px',
                fontWeight: 400,
                lineHeight: '24px',
              }}
            >
              You swap
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '20px',
                fontWeight: 400,
                lineHeight: '24px',
              }}
            >
              to receive
            </Typography>
          </div>

          <Box sx={{ position: 'relative', display: 'flex', minWidth: '629.63px' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', zIndex: 10 }}>
              <TokenSelection
                tokens={tokens}
                selectedToken={selectedInputToken}
                onTokenSelect={setSelectedInputToken}
                balance={bigIntToFloat(inputTokenBalance)}
                amount={inputAmount}
                onAmountChange={handleInputChange}
                alignment="start"
                decimals={7}
              />
            </Box>
            <Box sx={{ width: '100%', zIndex: 10 }}>
              <TokenSelection
                tokens={tokens}
                selectedToken={selectedOutputToken}
                onTokenSelect={setSelectedOutputToken}
                balance={bigIntToFloat(outputTokenBalance)}
                amount={outputAmount}
                onAmountChange={() => {}}
                alignment="end"
                decimals={7}
              />
            </Box>
            <div className="absolute left-0 top-0 w-full h-full">
              <Image
                src={swapBackground.src}
                width={swapBackground.width}
                height={swapBackground.height}
                alt="swap-back"
              />
            </div>
          </Box>

          <p className="text-center text-[#999999]">Slippage: 3%</p>
        </div>

        <div className="flex justify-between px-4 pb-3">
          <p className="text-[#ffffffcc]">
            1 {selectedInputToken.code} = {Number(exchageRate).toFixed(2)}{' '}
            {selectedOutputToken.code}{' '}
          </p>
          <p className="text-[#ffffffcc]  flex items-center justify-center gap-2">
            <SellOutlinedIcon />
            0.3% = {(Number(outputAmount) * 0.003).toFixed(2)} {selectedOutputToken.code}
          </p>
        </div>

        {inputAmount && outputAmount && (
          <Box
            sx={{
              px: '196px',
              py: '38px',
              color: 'white',
              background:
                'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
              borderRadius: '16px',
              mb: 3,
              border: 2,
              borderColor: 'rgba(255, 255, 255, 0.32)',
            }}
          >
            <Typography
              align="center"
              gutterBottom
              sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}
            >
              {Number(bigIntToFloat(inputTokenBalance)) >= Number(inputAmount)
                ? 'Transaction Overview'
                : 'BalanceError!'}
            </Typography>
            {Number(bigIntToFloat(inputTokenBalance)) >= Number(inputAmount) && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={12}>
                  <OverviewItem
                    label="You Swap"
                    value={`${inputAmount} ${selectedInputToken.code}`}
                  />
                  <OverviewItem
                    label="You Receive"
                    value={`${Number(outputAmount).toFixed(2)} ${selectedOutputToken.code}`}
                  />

                  <OverviewItem
                    icon={<LocalGasStationIcon />}
                    label="Gas:"
                    value={`${toBalance(BigInt((simResponse as any)?.minResourceFee ?? 0), 7)} XLM`}
                  />
                  <OverviewItem label="Platform Fee:" value={`0.3%`} />
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </div>
      <div>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleClick()}
          disabled={hasTrustline && (!connected || !inputAmount || parseFloat(inputAmount) <= 0 || isCalculating)}
          sx={{
            backgroundColor: '#2050F2',
            height: '62.96px',
            color: 'white',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '20px',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            '&:disabled': {
              backgroundColor: '#83868F',
              opacity: '32%',
              color: 'rgba(255, 255, 255)',
            },
          }}
        >
          {hasTrustline 
            ? (isCalculating ? 'Processing ... ' : 'Submit Transaction') 
            : 'Add trustline'
          }
        </Button>

        {txError && (
          <Typography color="error" align="center" sx={{ mt: 2, marginTop: '7.92px' }}>
            {txErrorMessage}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default SwapPage;
