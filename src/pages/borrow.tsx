import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Grid, Typography } from '@mui/material';
import { RequestType, SubmitArgs } from '@blend-capital/blend-sdk';
import { rpc, Asset } from '@stellar/stellar-sdk';
import BorrowForm from '../components/borrow/BorrowForm';
import CollateralRatioSlider from '../components/borrow/CollateralRatioSlider';
import TransactionOverview from '../components/borrow/TransactionOverview';
import StyledGrid from '../components/common/StyledGrid';
import BalanceError from '../components/borrow/BalanceError';
import { useWallet } from '../contexts/wallet';
import { scaleInputToBigInt } from '../utils/scval';
import {
  usePool,
  usePoolOracle,
  usePoolUser,
  usePoolMeta,
  useHorizonAccount,
  useTokenBalance,
} from '../hooks/api';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../hooks/debounce';
import { toBalance, toPercentage, bigIntToFloat } from '../utils/formatter';
import {
  NEXT_PUBLIC_POOL,
  NEXT_PUBLIC_COLLATERAL_ASSET,
  NEXT_PUBLIC_STABLECOIN_ASSET,
} from '../config/constants';

//TODO: Get this through config or API
const poolId = NEXT_PUBLIC_POOL || 'CC7OVK4NABUX52HD7ZBO7PQDZEAUJOH55G6V7OD6Q7LB6HNVPN7JYIEU';

const Borrow: NextPage = () => {
  const [collateralRatio, setCollateralRatio] = useState<number>(135);
  const [borrowAmount, setBorrowAmount] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [supplyAmount, setSupplyAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<rpc.Api.SimulateTransactionResponse | undefined>(
    undefined,
  );

  const assetId =
    NEXT_PUBLIC_COLLATERAL_ASSET || 'CBZFW4ICZQY6WUKDI2EFRGKICT36QTLHZGS7BZTGJQ7RHCA2OTLO2PNM';
  const stablecoinId =
    NEXT_PUBLIC_STABLECOIN_ASSET || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

  const assetToken = {
    code: 'XLM',
    contract: NEXT_PUBLIC_COLLATERAL_ASSET || '',
    icon: '/icons/tokens/xlm.svg',
    decimals: 7,
    asset: new Asset('XLM', 'GAXHVI4RI4KFLWWEZSUNLDKMQSKHRBCFB44FNUZDOGSJODVX5GAAKOMX'),
  };

  const { poolSubmit, txType, walletAddress } = useWallet();
  const { data: poolMeta, error: poolError } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: poolUser } = usePoolUser(pool);
  const { data: horizonAccount } = useHorizonAccount();

  const collateral = pool?.reserves.get(NEXT_PUBLIC_COLLATERAL_ASSET || '');
  const stablecoin = pool?.reserves.get(NEXT_PUBLIC_STABLECOIN_ASSET || '');
  const reserve = pool?.reserves.get(stablecoinId);
  const assetToBase = poolOracle?.getPriceFloat(assetId);

  const { data: totalBalance } = useTokenBalance(
    assetToken.contract,
    assetToken.asset,
    horizonAccount,
  );

  //TODO: Fix the calculations to work using oracle price
  const handleCollateralRatioChange = (_event: Event, newValue: number | number[]) => {
    const ratio = Array.isArray(newValue) ? newValue[0] : newValue;
    setCollateralRatio(ratio);

    // Update supply amount based on new ratio only if borrowAmount exists
    if (borrowAmount && !isNaN(parseFloat(borrowAmount))) {
      const newSupplyAmount = (parseFloat(borrowAmount) * ratio).toFixed(2);
      setSupplyAmount(newSupplyAmount);
    }
  };

  const handleBorrowChange = (value: string) => {
    setCollateralAmount(value);

    // If the value is empty or not a number, just set supply to empty
    if (!value || isNaN(parseFloat(value))) {
      setSupplyAmount('');
      return;
    }

    // Only calculate if we have a valid number
    const numValue = parseFloat(value);
    const supplyValue = (numValue * collateralRatio).toFixed(2);
    setSupplyAmount(supplyValue);
  };

  const handleSubmitTransaction = async (
    sim: boolean,
  ): Promise<rpc.Api.SimulateTransactionResponse | undefined> => {
    if (collateralAmount && walletAddress && collateral && stablecoin) {
      setIsLoading(true);
      try {
        let submitArgs: SubmitArgs = {
          from: walletAddress,
          to: walletAddress,
          spender: walletAddress,
          requests: [
            {
              amount: scaleInputToBigInt(collateralAmount, collateral.config.decimals),
              request_type: RequestType.SupplyCollateral,
              address: collateral.assetId,
            },
            {
              amount: scaleInputToBigInt(calculateSupplyAmount(), stablecoin.config.decimals),
              request_type: RequestType.Borrow,
              address: stablecoin.assetId,
            },
          ],
        };
        return await poolSubmit(poolMeta, submitArgs, sim);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const calculateSupplyAmount = (): string => {
    if (!collateralAmount || isNaN(parseFloat(collateralAmount))) {
      return '';
    }
    const baseRate = assetToBase || 1;
    const numValue = parseFloat(collateralAmount);
    // If I want to borrow 1 USDC, I need to supply (1 * collateralRatio/100) / price XLM
    return ((numValue / (collateralRatio / 100)) * baseRate).toFixed(2);
  };

  useDebouncedState(collateralAmount, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    let response = await handleSubmitTransaction(true);
    if (response !== undefined) {
      setSimResponse(response);
    }
  });

  return (
    <>
      <StyledGrid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white', paddingBlock: '24px' }}>
            <Typography variant="subtitle2">Borrow APY</Typography>
            <Typography variant="h6">{toPercentage(reserve?.borrowApr)}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', color: 'white', paddingBlock: '24px' }}>
            <Typography variant="subtitle2">Liability Factor</Typography>
            <Typography variant="h6">{toPercentage(reserve?.getLiabilityFactor())}</Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center', color: 'white', paddingBlock: '24px' }}>
            <Typography variant="subtitle2">Total Borrowed</Typography>
            <Typography variant="h6">${toBalance(reserve?.totalLiabilitiesFloat())}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important', paddingBlock: '28px' }}>
          <BorrowForm
            collateralAmount={collateralAmount}
            borrowAmount={calculateSupplyAmount()}
            onBorrowChange={handleBorrowChange}
            assetToBase={assetToBase}
            collateralRatio={collateralRatio}
          />
        </Grid>

        <Grid item xs={12} sx={{ borderRight: '0px !important' }}>
          <CollateralRatioSlider value={collateralRatio} onChange={handleCollateralRatioChange} />
        </Grid>

        {collateralAmount !== '' &&
          (Number(collateralAmount) < Number(bigIntToFloat(totalBalance)) ? (
            <Grid item xs={12} sx={{ padding: '0px !important' }}>
              <TransactionOverview
                symbol={'XLM'}
                collateralRatio={collateralRatio}
                collateralAmount={collateralAmount}
                assetToBase={assetToBase}
                decimals={7}
                userPoolData={poolUser}
                newPositionEstimate={null}
                assetId={assetId} // Replace with actual asset ID
                simResponse={simResponse}
                isLoading={isLoading}
              />
            </Grid>
          ) : (
            <BalanceError />
          ))}
      </StyledGrid>

      <Button
        variant="contained"
        fullWidth
        onClick={() => handleSubmitTransaction(false)}
        disabled={isLoading || !collateralAmount || !walletAddress}
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
