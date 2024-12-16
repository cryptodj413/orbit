import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import BorrowForm from '../components/borrow/BorrowForm';
import CollateralRatioSlider from '../components/borrow/CollateralRatioSlider';
import TransactionOverview from '../components/borrow/TransactionOverview';
import StyledGrid from '../components/common/StyledGrid';
import { useWallet } from '../contexts/wallet';
import { toBalance } from '../utils/formatter';
import { scaleInputToBigInt } from '../utils/scval';
import { RequestType, SubmitArgs } from '@blend-capital/blend-sdk';
import { useHorizonAccount, usePool, usePoolOracle, usePoolUser } from '../hooks/api';
import { useSorobanReact } from '@soroban-react/core';

const POOL_ID = process.env.NEXT_PUBLIC_BLND_POOL || '';

const Borrow: NextPage = () => {
  const [collateralRatio, setCollateralRatio] = useState<number>(110);
  const [borrowAmount, setBorrowAmount] = useState<string>('');
  const [supplyAmount, setSupplyAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { connected, poolSubmit, txStatus, txType } = useWallet();
  const { address } = useSorobanReact();

  const { data: pool } = usePool(POOL_ID);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: poolUser } = usePoolUser(pool);
  const reserve = pool?.reserves.get('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata.symbol ?? 'XLM';

  const handleCollateralRatioChange = (_event: Event, newValue: number | number[]) => {
    const ratio = Array.isArray(newValue) ? newValue[0] : newValue;
    setCollateralRatio(ratio);

    // Update supply amount based on new ratio only if borrowAmount exists
    if (borrowAmount && !isNaN(parseFloat(borrowAmount))) {
      const newSupplyAmount = ((parseFloat(borrowAmount) * ratio) / 100).toFixed(2);
      setSupplyAmount(newSupplyAmount);
    }
  };

  const handleBorrowChange = (value: string) => {
    console.log('handleBorrowChange received:', value);
    setBorrowAmount(value);

    // If the value is empty or not a number, just set supply to empty
    if (!value || isNaN(parseFloat(value))) {
      setSupplyAmount('');
      return;
    }

    // Only calculate if we have a valid number
    const numValue = parseFloat(value);
    const supplyValue = ((numValue * collateralRatio) / 100).toFixed(2);
    setSupplyAmount(supplyValue);
  };

  const handleSupplyChange = (value: string) => {
    console.log('handleSupplyChange received:', value);
    setSupplyAmount(value);

    // If the value is empty or not a number, just set borrow to empty
    if (!value || isNaN(parseFloat(value))) {
      setBorrowAmount('');
      return;
    }

    // Only calculate if we have a valid number
    const numValue = parseFloat(value);
    const borrowValue = ((numValue * 100) / collateralRatio).toFixed(2);
    setBorrowAmount(borrowValue);
  };

  const handleSubmitTransaction = async () => {
    if (borrowAmount && address && reserve) {
      setIsLoading(true);
      try {
        let submitArgs: SubmitArgs = {
          from: address,
          to: address,
          spender: address,
          requests: [
            {
              amount: scaleInputToBigInt(supplyAmount, reserve.config.decimals),
              request_type: RequestType.SupplyCollateral,
              address: reserve.assetId,
            },
            {
              amount: scaleInputToBigInt(borrowAmount, reserve.config.decimals),
              request_type: RequestType.Borrow,
              address: reserve.assetId,
            },
          ],
        };
        await poolSubmit(POOL_ID, submitArgs, false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const assetToBase = poolOracle?.getPriceFloat(
    'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  );

  return (
    <>
      <StyledGrid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Borrow APY</Typography>
            <Typography variant="h6">3%</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Liability Factor</Typography>
            <Typography variant="h6">
              {((reserve?.getLiabilityFactor() ?? 0) * 100).toFixed(2)}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="subtitle2">Liquidation Price</Typography>
            <Typography variant="h6">
              ${borrowAmount ? (Number(borrowAmount) / 0.8).toFixed(2) : '0.00'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <BorrowForm
            borrowAmount={borrowAmount}
            onBorrowChange={handleBorrowChange}
            assetToBase={assetToBase}
            collateralRatio={collateralRatio}
          />
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <CollateralRatioSlider value={collateralRatio} onChange={handleCollateralRatioChange} />
        </Grid>

        {borrowAmount !== '' && (
          <Grid item xs={12} sx={{ padding: '0px !important' }}>
            <TransactionOverview
              amount={null}
              symbol={reserve?.tokenMetadata?.symbol ?? ''}
              collateralRatio={collateralRatio}
              collateralAmount={null}
              assetToBase={assetToBase}
              decimals={decimals}
              userPoolData={poolUser}
              newPositionEstimate={null}
              assetId={'your_asset_id'} // Replace with actual asset ID
              simResponse={null}
              isLoading={isLoading}
            />
          </Grid>
        )}
      </StyledGrid>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmitTransaction}
        disabled={isLoading || !borrowAmount || !address}
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
        {isLoading ? 'Processing...' : 'Submit Transaction'}
      </Button>
    </>
  );
};

export default Borrow;
