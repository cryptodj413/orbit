import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { NextPage } from 'next';
import { Box, Button, Grid, Typography, CircularProgress } from '@mui/material';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { useSorobanReact } from '@soroban-react/core';
import BorrowForm from '../components/borrow/BorrowForm';
import CollateralRatioSlider from '../components/borrow/CollateralRatioSlider';
import TransactionOverview from '../components/borrow/TransactionOverview';
import StyledGrid from '../components/common/StyledGrid';
import { TxStatus, TxType, useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';
import { scaleInputToBigInt } from '../utils/scval';
import {
  parseResult,
  PoolContract,
  PositionEstimates,
  Positions,
  RequestType,
  SubmitArgs,
} from '@blend-capital/blend-sdk';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../hooks/debounce';
import { useHorizonAccount, usePool, usePoolOracle, usePoolUser } from '../hooks/api';
import useGetMyBalances from '../hooks/useGetMyBalances';
import { TokenType } from '../interfaces';

// Define available tokens - you might want to move this to a config file
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
  // Add other tokens as needed
];

const POOL_ID = 'CD2OM6AQMIXPS6ODWAYDEKLLFX5376ZHUFCMSSQJ5ACPVKMTK5NOQC5D';

const Borrow: NextPage = () => {
  // State management
  const [collateralRatio, setCollateralRatio] = useState<number>(200);
  const [collateralToken, setCollateralToken] = useState<TokenType>(tokens[0]);
  const [debtToken, setDebtToken] = useState<TokenType>(tokens[1]);
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [debtAmount, setDebtAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<SorobanRpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<Positions>();

  // Hooks
  const { address } = useSorobanReact();
  const { poolSubmit, txStatus, txType } = useWallet();
  const { tokenBalancesResponse } = useGetMyBalances();

  // Data fetching
  const poolData = useStore((state) => state.pools.get(POOL_ID));
  const { data: pool } = usePool(POOL_ID);
  const { data: poolOracle } = usePoolOracle(pool);
  const poolUser = useStore((state) => state.userPoolData.get(POOL_ID));
  const { data: horizonAccount } = useHorizonAccount();

  // Get reserve data for current collateral token
  const reserve = pool?.reserves.get(collateralToken.contract);

  // Reset amounts on successful transaction
  useEffect(() => {
    if (txStatus === TxStatus.SUCCESS && txType === TxType.CONTRACT) {
      setCollateralAmount('');
      setDebtAmount('');
    }
  }, [txStatus, txType]);

  // Calculate position estimates

  const newPositionEstimate = useMemo(() => {
    if (poolData && parsedSimResult) {
      return PositionEstimates.build(poolData, parsedSimResult);
    }
    return undefined;
  }, [poolData, parsedSimResult]);

  // Get token balance
  const getTokenBalance = useCallback(
    (token: TokenType) => {
      if (!tokenBalancesResponse?.balances) return '0';
      const tokenBalance = tokenBalancesResponse.balances.find(
        (b) => b.contract === token.contract,
      );
      return tokenBalance?.balance?.toString() || '0';
    },
    [tokenBalancesResponse],
  );

  const getDecimals = (reserve: any): number => {
    return reserve?.config?.decimals ?? 7;
  };

  // Handle token selection
  const handleCollateralTokenSelect = (token: TokenType) => {
    if (token.contract === debtToken.contract) {
      setDebtToken(collateralToken);
    }
    setCollateralToken(token);
    // Reset amounts when token changes
    setCollateralAmount('');
    setDebtAmount('');
  };

  const handleDebtTokenSelect = (token: TokenType) => {
    if (token.contract === collateralToken.contract) {
      setCollateralToken(debtToken);
    }
    setDebtToken(token);
    // Reset amounts when token changes
    setCollateralAmount('');
    setDebtAmount('');
  };

  // Handle amount changes
  const handleCollateralAmountChange = (value: string) => {
    setCollateralAmount(value);
    if (value && !isNaN(Number(value))) {
      const newDebtAmount = (Number(value) * (collateralRatio / 100)).toString();
      setDebtAmount(newDebtAmount);
    } else {
      setDebtAmount('');
    }
  };

  const handleDebtAmountChange = (value: string) => {
    setDebtAmount(value);
    if (value && !isNaN(Number(value))) {
      const newCollateralAmount = (Number(value) / (collateralRatio / 100)).toString();
      setCollateralAmount(newCollateralAmount);
    } else {
      setCollateralAmount('');
    }
  };

  // Handle collateral ratio changes
  const handleCollateralRatioChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setCollateralRatio(value);
    if (collateralAmount && !isNaN(Number(collateralAmount))) {
      const newDebtAmount = (Number(collateralAmount) * (value / 100)).toString();
      setDebtAmount(newDebtAmount);
    }
  };

  // Simulate transaction
  const simulateTransaction = async (amount: string) => {
    if (!amount || !reserve || !address) return;

    const submitArgs: SubmitArgs = {
      from: address,
      to: address,
      spender: address,
      requests: [
        {
          amount: scaleInputToBigInt(amount, getDecimals(collateralToken.decimals)),
          address: collateralToken.contract,
          request_type: RequestType.SupplyCollateral,
        },
        {
          amount: scaleInputToBigInt(amount, getDecimals(debtToken.decimals)),
          address: debtToken.contract,
          request_type: RequestType.Borrow,
        },
      ],
    };

    return await poolSubmit(POOL_ID, submitArgs, true);
  };

  // Debounced simulation
  useDebouncedState(collateralAmount, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    setParsedSimResult(undefined);
    setIsLoading(true);

    const response = await simulateTransaction(collateralAmount);
    if (response) {
      setSimResponse(response);
      if (SorobanRpc.Api.isSimulationSuccess(response)) {
        setParsedSimResult(parseResult(response, PoolContract.parsers.submit));
      }
    }

    setIsLoading(false);
  });

  // Handle transaction submission
  const handleSubmitTransaction = async () => {
    if (!collateralAmount || !address || !reserve) {
      console.log('Missing required data:', { collateralAmount, address, reserve });
      return;
    }

    setIsLoading(true);
    try {
      // First supply collateral
      const supplyArgs: SubmitArgs = {
        from: address,
        to: address,
        spender: address,
        requests: [
          {
            amount: scaleInputToBigInt(collateralAmount, getDecimals(collateralToken.decimals)),
            request_type: RequestType.SupplyCollateral,
            address: collateralToken.contract,
          },
        ],
      };
      await poolSubmit(POOL_ID, supplyArgs, false);

      // Then borrow
      const borrowArgs: SubmitArgs = {
        from: address,
        to: address,
        spender: address,
        requests: [
          {
            amount: scaleInputToBigInt(debtAmount, getDecimals(debtToken.decimals)),
            address: debtToken.contract,
            request_type: RequestType.Borrow,
          },
        ],
      };
      await poolSubmit(POOL_ID, borrowArgs, false);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate rates and factors
  const assetToBase = poolOracle?.getPriceFloat(collateralToken.contract) ?? 1;
  const assetToEffectiveLiability = assetToBase * (reserve?.getLiabilityFactor() ?? 1);

  return (
    <>
      <StyledGrid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Borrow APY</Typography>
            <Typography variant="h6">{toPercentage(0)}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Liability Factor</Typography>
            <Typography variant="h6">{toPercentage(reserve?.getLiabilityFactor() ?? 0)}</Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Total Borrowed</Typography>
            <Typography variant="h6">
              {toBalance(reserve?.estimates.borrowed ?? 0, collateralToken.decimals)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <BorrowForm
            tokens={tokens}
            collateralToken={collateralToken}
            debtToken={debtToken}
            collateralAmount={collateralAmount}
            debtAmount={debtAmount}
            onCollateralTokenSelect={handleCollateralTokenSelect}
            onDebtTokenSelect={handleDebtTokenSelect}
            onCollateralAmountChange={handleCollateralAmountChange}
            onDebtAmountChange={handleDebtAmountChange}
            getTokenBalance={getTokenBalance}
          />
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <CollateralRatioSlider value={collateralRatio} onChange={handleCollateralRatioChange} />
        </Grid>

        {collateralAmount !== '' && (
          <Grid item xs={12} sx={{ padding: '0px !important' }}>
            <TransactionOverview
              amount={collateralAmount}
              symbol={collateralToken.code}
              collateralRatio={collateralRatio}
              collateralAmount={collateralAmount}
              assetToBase={assetToBase}
              decimals={getDecimals(reserve)}
              userPoolData={poolUser}
              newPositionEstimate={newPositionEstimate}
              assetId={collateralToken.contract}
              simResponse={simResponse}
              isLoading={isLoading}
            />
          </Grid>
        )}
      </StyledGrid>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmitTransaction}
        disabled={!collateralAmount || isLoading}
        sx={{
          mt: 2,
          padding: '16px 8px',
          background: '#2050F2',
          color: 'white',
          '&:hover': {
            background: '#1565c0',
          },
          '&:disabled': {
            background: '#1a2847',
            color: 'rgba(255, 255, 255, 0.3)',
          },
          borderRadius: '7px',
        }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Submit Transaction'}
      </Button>
    </>
  );
};

export default Borrow;
