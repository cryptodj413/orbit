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
  PositionsEstimate,
  Positions,
  RequestType,
  SubmitArgs,
  PoolUser,
} from '@blend-capital/blend-sdk';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../hooks/debounce';
import { useHorizonAccount, usePool, usePoolOracle, usePoolUser } from '../hooks/api';
import { useSettings } from '../contexts';

const POOL_ID = 'CCEVW3EEW4GRUZTZRTAMJAXD6XIF5IG7YQJMEEMKMVVGFPESTRXY2ZAV';

const Borrow: NextPage = () => {
  const [collateralRatio, setCollateralRatio] = useState<number>(200);
  const [xlmAmount, setXlmAmount] = useState<string>('');
  const [oUsdAmount, setOUsdAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const theme = useTheme();
  const { viewType } = useSettings();

  const { connected, walletAddress, poolSubmit, txStatus, txType, createTrustline } = useWallet();

  const { data: pool } = usePool(POOL_ID);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: poolUser } = usePoolUser(pool);
  const reserve = pool?.reserves.get('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata.symbol ?? 'token';
  const { data: horizonAccount } = useHorizonAccount();

  const [toBorrow, setToBorrow] = useState<string>('');
  const [simResponse, setSimResponse] = useState<SorobanRpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<Positions>();
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(false);
  const loading = isLoading || loadingEstimate;

  if (txStatus === TxStatus.SUCCESS && txType === TxType.CONTRACT && Number(toBorrow) != 0) {
    setToBorrow('');
  }

  const handleCollateralRatioChange = (event: Event, newValue: number | number[]) => {
    setCollateralRatio(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const handleXlmChange = (value: string) => {
    setXlmAmount(value);
  };

  const handleOUsdChange = (value: string) => {
    setOUsdAmount(value);
  };

  useDebouncedState(xlmAmount, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    setParsedSimResult(undefined);
    let response = await simulateTransaction(xlmAmount);
    if (response) {
      setSimResponse(response);
      if (SorobanRpc.Api.isSimulationSuccess(response)) {
        setParsedSimResult(parseResult(response, PoolContract.parsers.submit));
      }
    }
    setIsLoading(false);
  });

  const simulateTransaction = async (amount: string) => {
    setIsLoading(true);

    if (amount && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
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
      return await poolSubmit(POOL_ID, submitArgs, true); // Replace with actual pool ID
    }
  };

  const curPositionEstimate =
    pool && poolOracle && poolUser
      ? PositionsEstimate.build(pool, poolOracle, poolUser.positions)
      : undefined;
  const newPoolUser = parsedSimResult && new PoolUser(walletAddress, parsedSimResult, new Map());
  const newPositionEstimate =
    pool && poolOracle && parsedSimResult
      ? PositionsEstimate.build(pool, poolOracle, parsedSimResult)
      : undefined;

  const assetToBase = poolOracle?.getPriceFloat(
    'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
  );

  const assetToEffectiveLiability = assetToBase
    ? assetToBase * reserve.getLiabilityFactor()
    : undefined;
  const curBorrowCap =
    curPositionEstimate && assetToEffectiveLiability
      ? curPositionEstimate.borrowCap / assetToEffectiveLiability
      : undefined;
  const nextBorrowCap =
    newPositionEstimate && assetToEffectiveLiability
      ? newPositionEstimate.borrowCap / assetToEffectiveLiability
      : undefined;
  const curBorrowLimit =
    curPositionEstimate && Number.isFinite(curPositionEstimate.borrowLimit)
      ? curPositionEstimate.borrowLimit
      : 0;
  const nextBorrowLimit =
    newPositionEstimate && Number.isFinite(newPositionEstimate?.borrowLimit)
      ? newPositionEstimate?.borrowLimit
      : 0;

  const handleSubmitTransaction = async () => {
    console.log(
      {
        amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
        address: reserve.assetId,
        request_type: RequestType.Borrow,
      },
      {
        amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
        request_type: RequestType.SupplyCollateral,
        address: reserve.assetId,
      }
    );
    if (xlmAmount && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
            request_type: RequestType.SupplyCollateral,
            address: reserve.assetId,
          },
          // {
          //   amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
          //   address: reserve.assetId,
          //   request_type: RequestType.Borrow,
          // },
        ],
      };
      await poolSubmit(POOL_ID, submitArgs, false); // Replace with actual pool ID
      submitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          // {
          //   amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
          //   request_type: RequestType.SupplyCollateral,
          //   address: reserve.assetId,
          // },
          {
            amount: scaleInputToBigInt(xlmAmount, reserve.config.decimals),
            address: reserve.assetId,
            request_type: RequestType.Borrow,
          },
        ],
      };
      await poolSubmit(POOL_ID, submitArgs, false);
    } else {
      console.log(xlmAmount, connected, reserve);
    }
  };

  if (txStatus === TxStatus.SUCCESS && txType === TxType.CONTRACT && Number(xlmAmount) != 0) {
    setXlmAmount('');
    setOUsdAmount('');
  }

  return (
    <>
      <StyledGrid>
        {/* First row */}
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Borrow APY</Typography>
            {/* <Typography variant="h6">{toPercentage(reserve?.estimates.borrowApy ?? 0)}</Typography> */}
            <Typography variant="h6">3%</Typography>
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
              {/* {toBalance(reserve?.estimates.borrowed ?? 0, decimals)} */}
            </Typography>
          </Box>
        </Grid>

        {/* Second row */}
        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <BorrowForm
            xlmAmount={xlmAmount}
            oUsdAmount={oUsdAmount}
            onXlmChange={handleXlmChange}
            onOUsdChange={handleOUsdChange}
          />
        </Grid>

        {/* Third row */}
        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <CollateralRatioSlider value={collateralRatio} onChange={handleCollateralRatioChange} />
        </Grid>

        {/* Fourth row */}
        {xlmAmount !== '' && (
          <Grid item xs={12} sx={{ padding: '0px !important' }}>
            <TransactionOverview
              amount={xlmAmount}
              symbol={reserve?.tokenMetadata?.symbol ?? ''}
              collateralRatio={collateralRatio}
              collateralAmount={xlmAmount}
              assetToBase={assetToBase}
              decimals={decimals}
              userPoolData={poolUser}
              newPositionEstimate={newPositionEstimate}
              assetId={'your_asset_id'} // Replace with actual asset ID
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
        disabled={false}
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
