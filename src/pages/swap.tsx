import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { StrKey, Asset, rpc } from '@stellar/stellar-sdk';
import { Box, Button, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { useHorizonAccount, useTokenBalance } from '../hooks/api';
import TokenSelection from '../components/common/TokenSelection';
import { TokenType } from '../interfaces';
import { useWallet, TxStatus } from '../contexts/wallet';
import swapBackground from '../../public/swapBackground.svg';
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import { toBalance } from '../utils/formatter';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../hooks/debounce';

const DECIMALS = 7;
const DECIMAL_MULTIPLIER = 10 ** DECIMALS;
const SLIPPAGE = 1.0; // Fixed 1% slippage

const tokens = [
  {
    code: 'XLM',
    contract: process.env.NEXT_PUBLIC_COLLATERAL_ASSET || '',
    icon: '/icons/tokens/xlm.svg',
    decimals: 7,
    asset: new Asset('XLM', 'GAXHVI4RI4KFLWWEZSUNLDKMQSKHRBCFB44FNUZDOGSJODVX5GAAKOMX'),
  },
  {
    code: 'oUSD',
    contract: process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '',
    icon: '/icons/tokens/ousd.svg',
    decimals: 7,
    asset: new Asset('OUSD', 'GAXHVI4RI4KFLWWEZSUNLDKMQSKHRBCFB44FNUZDOGSJODVX5GAAKOMX'),
  },
];

const OverviewItem = ({label, value, icon}: {
  label: string;
  value: string;
  icon?: React.ReactElement
}) => {
  const [first, setFirst] = useState(true);

  useEffect(() => {
    setFirst(false)
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
        {!first && icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
        {label}
      </Typography>
      <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

const SwapPage: NextPage = () => {
  const [simResponse, setSimResponse] = useState<rpc.Api.SimulateTransactionResponse | undefined>(
    undefined,
  );
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [outputAmount, setOutputAmount] = useState<string>('0');
  const [exchageRate, setExchangeRate] = useState<string>('0')
  const [selectedInputToken, setSelectedInputToken] = useState<TokenType>(tokens[0]);
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenType>(tokens[1]);
  const [pairAddress, setPairAddress] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string>();

  const {
    connected,
    walletAddress,
    txType,
    swapExactTokensForTokens,
    routerPairFor,
    routerGetAmountOut,
    routerGetAmountIn,
    setTxStatus
  } = useWallet();
 
  const { data: horizonAccount } = useHorizonAccount();
  // console.log('Calling useTokenBalance with:', selectedInputToken.contract, horizonAccount);

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

        const response = await routerPairFor(process.env.NEXT_PUBLIC_ROUTER_ID || '', args);

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

  useEffect(() => {
    getOutputAmount(inputAmount)
  }, [selectedInputToken, selectedOutputToken])

  const getOutputAmount = async (inputValue: string) => {
    if (!inputValue || isNaN(parseFloat(inputValue)) || !connected) {
      setOutputAmount('');
      return;
    }
    // setIsCalculating(true)
    try {
      if(selectedInputToken.code === selectedOutputToken.code) {
        setOutputAmount(inputValue)
        setExchangeRate("1")
        return
      }

      const args = {
        amount_in: floatToBigInt(inputValue),
        path: [selectedInputToken.contract, selectedOutputToken.contract],
      };

      const response = await routerGetAmountOut(process.env.NEXT_PUBLIC_ROUTER_ID || '', args);

      if (response?.result?.retval?._value) {
        const outputValue = response.result.retval._value[1];
        if (outputValue?._value?._attributes?.lo?._value) {
          const amount = bigIntToFloat(BigInt(outputValue._value._attributes.lo._value));
          setOutputAmount(amount);
          const rate = Number(amount) / Number(inputValue);
          setExchangeRate(String(rate))
        }
      }
    } catch (error) {
      console.error('Failed to get output amount:', error);
      setOutputAmount('');
    } finally {
      // setIsCalculating(false);
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

  const handleSwap = async (sim: boolean): Promise<rpc.Api.SimulateTransactionResponse | undefined> => {
    if( inputAmount && outputAmount && walletAddress && connected ) {
      if(!sim){
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

        const result = await swapExactTokensForTokens(process.env.NEXT_PUBLIC_ROUTER_ID || '', args, sim);
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
    console.log('useDebouncedState');
    setSimResponse(undefined);
    // setParsedSimResult(undefined);
    let response = await handleSwap(true);
    console.log('swap response 1', response);
    if (response !== undefined) {
      console.log('swap response 2', response);
      setSimResponse(response);
      // if (rpc.Api.isSimulationSuccess(response)) {
      //   setParsedSimResult(parseResult(response, PoolContractV1.parsers.submit));
      // }
    }
    // setLoadingEstimate(false);
  });

  return (
    <div>
      <div>
        {/* Header */}
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

          {/* Token Selection Section */}
          <Box sx={{ position: 'relative', display: 'flex', minWidth: '629.63px' }}>
            {/* <SwapIcon /> */}
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
              <img src={swapBackground.src} width={'100%'} height={'100%'} />
            </div>
          </Box>

          <p className="text-center text-[#999999]">Slippage: 3%</p>
        </div>

        <div className="flex justify-between px-4 pb-3">
          <p className="text-[#ffffffcc]">1 {selectedInputToken.code} = {Number(exchageRate).toFixed(2)} {selectedOutputToken.code} </p>
          <p className="text-[#ffffffcc]">0.5% = 154.12 XLM</p>
        </div>

        {/* Transaction Overview */}
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
              Transaction Overview
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={12}>
                {/* <Typography variant="subtitle2" gutterBottom>
                  Swap Details
                </Typography> */}
                <OverviewItem
                  label="You Swap"
                  value={`${inputAmount} ${selectedInputToken.code}`}
                />
                <OverviewItem
                  label="You Receive"
                  value={`${Number(outputAmount).toFixed(2)} ${selectedOutputToken.code}`}
                />
                {/* <OverviewItem
                  label="Minimum Received:"
                  value={`${(parseFloat(outputAmount) * (1 - SLIPPAGE / 100)).toFixed(7)} ${
                    selectedOutputToken.code
                  }`}
                /> */}
                <OverviewItem
                  icon={<LocalGasStationIcon />}
                  label="Gas:"
                  value={`${toBalance(BigInt((simResponse as any)?.minResourceFee ?? 0), 7)} XLM`}
                />
                <OverviewItem label="Platform Fee:" value={`0.5%`} />
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Network Details
                </Typography>
                <OverviewItem
                  label="Rate:"
                  value={`1 ${selectedInputToken.code} = ${(
                    parseFloat(outputAmount) / parseFloat(inputAmou nt)
                  ).toFixed(7)} ${selectedOutputToken.code}`}
                />
              </Grid> */}
            </Grid>
          </Box>
        )}
      </div>
      {/* <Dropdown /> */}
      <div>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleSwap(false)}
          disabled={!connected || !inputAmount || parseFloat(inputAmount) <= 0 || isCalculating}
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
          {'Submit Transaction'}
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