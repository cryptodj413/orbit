import React, { useMemo } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { usePool, usePoolOracle, usePoolMeta } from '../../hooks/api';
import { toBalance } from '../../utils/formatter';
import { rpc } from '@stellar/stellar-sdk';
import { PositionsEstimate } from '@blend-capital/blend-sdk';
import { NEXT_PUBLIC_POOL } from '../../config/constants';

interface TransactionOverviewProps {
  symbol: string;
  collateralRatio: number;
  collateralAmount: string;
  assetToBase: number;
  decimals: number;
  userPoolData: any;
  newPositionEstimate: PositionsEstimate | undefined;
  assetId: string;
  simResponse: rpc.Api.SimulateTransactionResponse | undefined;
  isLoading: boolean;
}

const TransactionOverview: React.FC<TransactionOverviewProps> = ({
  symbol,
  collateralRatio,
  collateralAmount,
  assetToBase,
  userPoolData,
  newPositionEstimate,
  assetId,
  simResponse,
}) => {
  const xlmToOUsdRate = 0.091; // 1
  const poolId = NEXT_PUBLIC_POOL || 'CC7OVK4NABUX52HD7ZBO7PQDZEAUJOH55G6V7OD6Q7LB6HNVPN7JYIEU';
  const { data: poolMeta, error: poolError } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolOracle } = usePoolOracle(pool);
  const price = poolOracle?.getPriceFloat(assetId) || 0;

  const calculatedValues = useMemo(() => {
    const depositValue = Number(collateralAmount) * price;
    const maxBorrow = depositValue * (100 / collateralRatio);
    const currentBorrow = Number(collateralAmount) * xlmToOUsdRate;
    const effectiveCollateralRatio =
      currentBorrow > 0 ? (depositValue / currentBorrow) * 100 : collateralRatio;
    const liquidationPrice = (currentBorrow / 0.8).toFixed(2);
    const interestRate = '5%'; // Hardcoded as in BorrowAnvil

    const curBorrowCap = userPoolData?.positionEstimates?.borrowCap / assetToBase || 0;
    const nextBorrowCap = newPositionEstimate?.borrowCap / assetToBase || 0;
    const curBorrowLimit = Number.isFinite(userPoolData?.positionEstimates?.borrowLimit)
      ? userPoolData?.positionEstimates?.borrowLimit
      : 0;
    const nextBorrowLimit = Number.isFinite(newPositionEstimate?.borrowLimit)
      ? newPositionEstimate?.borrowLimit
      : 0;

    return {
      depositValue,
      maxBorrow,
      currentBorrow,
      effectiveCollateralRatio,
      liquidationPrice,
      interestRate,
      curBorrowCap,
      nextBorrowCap,
      curBorrowLimit,
      nextBorrowLimit,
    };
  }, [
    collateralAmount,
    collateralRatio,
    xlmToOUsdRate,
    assetToBase,
    userPoolData,
    newPositionEstimate,
    price,
  ]);

  return (
    <Box
      sx={{
        borderTop: '1px solid rgba(255, 255, 255, 0.32)',
        paddingInline: '34px',
        paddingBlock: '14px',
        color: 'white',
        background:
          'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
        borderBottomRightRadius: '17px',
        borderBottomLeftRadius: '17px',
      }}
    >
      <Typography
        variant="subtitle2"
        align="center"
        gutterBottom
        fontWeight="700"
        fontSize="16px"
        marginBottom="16px"
      >
        Transaction Overview
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom fontWeight="700" fontSize="13px">
            Collateral Details
          </Typography>
          <OverviewItem label="Deposit:" value={`${collateralAmount} ${symbol}`} />
          <OverviewItem
            label="Deposit Value:"
            value={`$${calculatedValues.depositValue.toFixed(2)} USD`}
          />
          <OverviewItem
            label="Collateral Ratio:"
            // value={`${calculatedValues.effectiveCollateralRatio.toFixed(2)}%`}
            value={`${collateralRatio}%`}
          />
          <OverviewItem
            label="Max Borrow:"
            value={`${calculatedValues.maxBorrow.toFixed(2)} oUSD`}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom fontWeight="700" fontSize="13px">
            Repayment and Fees
          </Typography>
          <OverviewItem
            label="Amount to repay:"
            value={`${calculatedValues.maxBorrow.toFixed(2)} oUSD`}
          />
          <OverviewItem
            label="Gas:"
            value={`${toBalance(BigInt((simResponse as any)?.minResourceFee ?? 0), 7)} XLM`}
            icon={<LocalGasStationIcon sx={{ width: '16px', height: '16px' }} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
interface OverviewItemProps {
  label: string;
  value: string;
  oldValue?: string;
  newValue?: string;
  icon?: React.ReactNode;
}

const OverviewItem: React.FC<OverviewItemProps> = ({ label, value, oldValue, newValue, icon }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </Typography>
    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
      {value}
      {oldValue && newValue && (
        <span style={{ marginLeft: '8px', fontSize: '11px', color: '#888' }}>
          ({oldValue} → {newValue})
        </span>
      )}
    </Typography>
  </Box>
);

export default TransactionOverview;
