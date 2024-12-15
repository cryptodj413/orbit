import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import BorrowForm from '../components/borrow/BorrowForm';
import CollateralRatioSlider from '../components/borrow/CollateralRatioSlider';
import TransactionOverview from '../components/borrow/TransactionOverview';
import StyledGrid from '../components/common/StyledGrid';
import { useWallet, TxStatus, TxType } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';
import { scaleInputToBigInt } from '../utils/scval';
import { getErrorFromSim } from '../utils/txSim';
import { SorobanRpc } from '@stellar/stellar-sdk';
import {
  parseResult,
  PoolContract,
  PositionEstimates,
  Positions,
  RequestType,
  SubmitArgs,
  PoolUser,
} from '@blend-capital/blend-sdk';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../hooks/debounce';
import { useHorizonAccount, usePool, usePoolOracle, usePoolUser } from '../hooks/api';
import { useSettings } from '../contexts';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { useSorobanReact } from '@soroban-react/core';

const POOL_ID = 'CD2OM6AQMIXPS6ODWAYDEKLLFX5376ZHUFCMSSQJ5ACPVKMTK5NOQC5D';
const XLM_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

const Borrow: NextPage = () => {
  const [collateralRatio, setCollateralRatio] = useState<number>(200);
  const [xlmAmount, setXlmAmount] = useState<string>('');
  const [oUsdAmount, setOUsdAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<SorobanRpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<Positions>();
  const { address } = useSorobanReact();
  const { connected, walletAddress, poolSubmit, txStatus, txType, createTrustline } = useWallet();

  // Data fetching hooks
  const poolData = useStore((state) =>
    state.pools.get('CCEVW3EEW4GRUZTZRTAMJAXD6XIF5IG7YQJMEEMKMVVGFPESTRXY2ZAV'),
  );
  const { data: pool } = usePool(POOL_ID);
  const { data: poolOracle } = usePoolOracle(pool);
  const poolUser = useStore((state) =>
    state.userPoolData.get('CCEVW3EEW4GRUZTZRTAMJAXD6XIF5IG7YQJMEEMKMVVGFPESTRXY2ZAV'),
  );
  const { data: horizonAccount } = useHorizonAccount();

  // Get reserve data
  const reserve = pool?.reserves.get(XLM_ADDRESS);
  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata?.symbol ?? 'XLM';

  // Reset amounts on successful transaction
  if (txStatus === TxStatus.SUCCESS && txType === TxType.CONTRACT && Number(xlmAmount) !== 0) {
    setXlmAmount('');
    setOUsdAmount('');
  }

  // Calculate position estimates
  const curPositionEstimate = useMemo(() => {
    // if (pool && poolOracle && poolUser) {
    //   return PositionEstimates.build(pool, poolOracle, poolUser.positions);
    // }
    return undefined;
  }, [pool, poolOracle, poolUser]);

  const newPositionEstimate = useMemo(() => {
    if (poolData && parsedSimResult) {
      return PositionEstimates.build(poolData, parsedSimResult);
    }
    return undefined;
  }, [pool, poolOracle, parsedSimResult]);

  // Calculate asset values
  const assetToBase = poolOracle?.getPriceFloat(XLM_ADDRESS) ?? 1;
  const assetToEffectiveLiability = assetToBase * (reserve?.getLiabilityFactor() ?? 1);

  // Calculate borrow caps and limits
  // const curBorrowCap =
  //   curPositionEstimate && assetToEffectiveLiability
  //     ? curPositionEstimate.borrowCap / assetToEffectiveLiability
  //     : 0;

  // const nextBorrowCap =
  //   newPositionEstimate && assetToEffectiveLiability
  //     ? newPositionEstimate.borrowCap / assetToEffectiveLiability
  //     : 0;

  // const curBorrowLimit = curPositionEstimate?.borrowLimit ?? 0;
  // const nextBorrowLimit = newPositionEstimate?.borrowLimit ?? 0;

  // Handle input changes
  const handleCollateralRatioChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setCollateralRatio(value);
    if (xlmAmount) {
      const newOUsdAmount = (Number(xlmAmount) * (value / 100)).toString();
      setOUsdAmount(newOUsdAmount);
    }
  };

  const handleXlmChange = (value: string) => {
    setXlmAmount(value);
    const newOUsdAmount = (Number(value) * (collateralRatio / 100)).toString();
    setOUsdAmount(newOUsdAmount);
  };

  const handleOUsdChange = (value: string) => {
    setOUsdAmount(value);
    const newXlmAmount = (Number(value) / (collateralRatio / 100)).toString();
    setXlmAmount(newXlmAmount);
  };
  //GBRC7D3G4W6ZX6CZSS57DNNWZ242SVKECSOQEU3FID3AFYBBOLB2CYSM

  // Simulate transaction
  const simulateTransaction = async (amount: string) => {
    if (!amount || !reserve) return;

    const submitArgs: SubmitArgs = {
      from: address!,
      to: address!,
      spender: address!,
      requests: [
        {
          amount: scaleInputToBigInt(amount, reserve.config.decimals),
          address: reserve.assetId,
          request_type: RequestType.Borrow,
        },
        {
          amount: scaleInputToBigInt(amount, reserve.config.decimals),
          request_type: RequestType.SupplyCollateral,
          address: reserve.assetId,
        },
      ],
    };

    return await poolSubmit(POOL_ID, submitArgs, true);
  };

  // Debounced simulation
  useDebouncedState(xlmAmount, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    setParsedSimResult(undefined);
    setIsLoading(true);

    const response = await simulateTransaction(xlmAmount);
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
    if (!xlmAmount || !reserve || !address) {
      console.log('Missing required data:', { xlmAmount, connected, reserve });
      return;
    }

    // First supply collateral
    const supplyArgs: SubmitArgs = {
      from: address,
      to: address,
      spender: address,
      requests: [
        {
          amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
          request_type: RequestType.SupplyCollateral,
          address: reserve.assetId,
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
          amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
          address: reserve.assetId,
          request_type: RequestType.Borrow,
        },
      ],
    };
    await poolSubmit(POOL_ID, borrowArgs, false);
  };

  // Your existing JSX return remains unchanged
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
              {toBalance(reserve?.estimates.borrowed ?? 0, decimals)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <BorrowForm
            xlmAmount={xlmAmount}
            oUsdAmount={oUsdAmount}
            onXlmChange={handleXlmChange}
            onOUsdChange={handleOUsdChange}
          />
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <CollateralRatioSlider value={collateralRatio} onChange={handleCollateralRatioChange} />
        </Grid>

        {xlmAmount !== '' && (
          <Grid item xs={12} sx={{ padding: '0px !important' }}>
            <TransactionOverview
              amount={xlmAmount}
              symbol={symbol}
              collateralRatio={collateralRatio}
              collateralAmount={xlmAmount}
              assetToBase={assetToBase}
              decimals={decimals}
              userPoolData={poolUser}
              newPositionEstimate={newPositionEstimate}
              assetId={XLM_ADDRESS}
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
        disabled={!xlmAmount || isLoading}
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
        Submit Transaction
      </Button>
    </>
  );
};

export default Borrow;
