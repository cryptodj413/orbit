import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import { RequestType, SubmitArgs } from '@blend-capital/blend-sdk';
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import BorrowForm from '../components/borrow/BorrowForm';
import CollateralRatioSlider from '../components/borrow/CollateralRatioSlider';
import TransactionOverview from '../components/borrow/TransactionOverview';
import StyledGrid from '../components/common/StyledGrid';

import { useWallet } from '../contexts/wallet';
import { scaleInputToBigInt } from '../utils/scval';
import { usePool, usePoolOracle, usePoolUser } from '../hooks/api';

//TODO: Get this through config or API
const POOL_ID = process.env.NEXT_PUBLIC_Pool || "CC7OVK4NABUX52HD7ZBO7PQDZEAUJOH55G6V7OD6Q7LB6HNVPN7JYIEU"

const Borrow: NextPage = () => {
  const [collateralRatio, setCollateralRatio] = useState<number>(135);
  const [borrowAmount, setBorrowAmount] = useState<string>('');
  const [supplyAmount, setSupplyAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { connected, poolSubmit, txStatus, txType, walletAddress } = useWallet();

  const { data: pool } = usePool(POOL_ID);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: poolUser } = usePoolUser(pool);

  const collateral = pool?.reserves.get(process.env.NEXT_PUBLIC_COLLATERAL_ASSET || '');
  const stablecoin = pool?.reserves.get(process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '');

  //TODO: Fix the calculations to work using oracle price
  const handleCollateralRatioChange = (_event: Event, newValue: number | number[]) => {
    const ratio = Array.isArray(newValue) ? newValue[0] : newValue;
    setCollateralRatio(ratio);

    // Update supply amount based on new ratio only if borrowAmount exists
    if (borrowAmount && !isNaN(parseFloat(borrowAmount))) {
      const newSupplyAmount = ((parseFloat(borrowAmount) * ratio)).toFixed(2);
      // console.log('newSupplyAmount:', newSupplyAmount);
      setSupplyAmount(newSupplyAmount);
    }
  };

  const handleBorrowChange = (value: string) => {
    // console.log('handleBorrowChange received:', value);
    setBorrowAmount(value);

    // If the value is empty or not a number, just set supply to empty
    if (!value || isNaN(parseFloat(value))) {
      setSupplyAmount('');
      return;
    }

    // Only calculate if we have a valid number
    const numValue = parseFloat(value);
    const supplyValue = ((numValue * collateralRatio)).toFixed(2);
    setSupplyAmount(supplyValue);
  };

  const handleSupplyChange = (value: string) => {
    // console.log('handleSupplyChange received:', value);
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
    if (borrowAmount && walletAddress && collateral && stablecoin) {
      setIsLoading(true);
      try {
        let submitArgs: SubmitArgs = {
          from: walletAddress,
          to: walletAddress,
          spender: walletAddress,
          requests: [
            {
              amount: scaleInputToBigInt(supplyAmount, collateral.config.decimals),
              request_type: RequestType.SupplyCollateral,
              address: collateral.assetId,
            },
            {
              amount: scaleInputToBigInt(borrowAmount, stablecoin.config.decimals),
              request_type: RequestType.Borrow,
              address: stablecoin.assetId,
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
          <Box sx={{ textAlign: 'center', color: 'white', paddingBlock: '24px' }}>
            <Typography variant="subtitle2">Borrow APY</Typography>
            <Typography variant="h6">4.00%</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', color: 'white',  paddingBlock: '24px'}}>
            <Typography variant="subtitle2">Liability Factor</Typography>
            <Typography variant="h6">
              100%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white', paddingBlock: '24px'}}>
            <Typography variant="subtitle2">Total Borrowed</Typography>
            <Typography variant="h6">
              ${borrowAmount ? (Number(borrowAmount) / 0.8).toFixed(2) : '0.00'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important', paddingBlock: '32px' }}>
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
              symbol={''}
              collateralRatio={collateralRatio}
              collateralAmount={null}
              assetToBase={assetToBase}
              decimals={7}
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
        disabled={isLoading || !borrowAmount || !walletAddress}
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
          fontWeight: '400',
          fontSize: '16px',
        }}
      >
        {isLoading ? 'Processing...' : 'Submit Transaction'}
      </Button>
    </>
  );
};

export default Borrow;
