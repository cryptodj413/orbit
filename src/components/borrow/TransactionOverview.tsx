import React, { useMemo } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { toBalance, toPercentage } from '../../utils/formatter';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { PositionEstimates } from '@blend-capital/blend-sdk';

interface TransactionOverviewProps {
  amount: string;
  symbol: string;
  collateralRatio: number;
  collateralAmount: string;
  assetToBase: number;
  decimals: number;
  userPoolData: any;
  newPositionEstimate: PositionEstimates | undefined;
  assetId: string;
  simResponse: SorobanRpc.Api.SimulateTransactionResponse | undefined;
  isLoading: boolean;
}

const TransactionOverview: React.FC<TransactionOverviewProps> = ({
  amount,
  symbol,
  collateralRatio,
  collateralAmount,
  assetToBase,
  decimals,
  userPoolData,
  newPositionEstimate,
  assetId,
  simResponse,
  isLoading,
}) => {
  const xlmToOUsdRate = 0.091; // 1 XLM = 0.091 oUSD

  const calculatedValues = useMemo(() => {
    const depositValue = Number(collateralAmount) * xlmToOUsdRate;
    const maxBorrow = depositValue * (100 / collateralRatio);
    const currentBorrow = Number(amount) * xlmToOUsdRate;
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
    amount,
    collateralAmount,
    collateralRatio,
    xlmToOUsdRate,
    assetToBase,
    userPoolData,
    newPositionEstimate,
  ]);

  return (
    <Box
      sx={{
        p: 3,
        color: 'white',
        background:
          'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
      }}
    >
      <Typography variant="subtitle2" align="center" gutterBottom>
        Transaction Overview
      </Typography>
      {!isLoading ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Collateral Details
            </Typography>
            <OverviewItem label="Deposit:" value={`${collateralAmount} ${symbol}`} />
            <OverviewItem
              label="Deposit Value:"
              value={`${calculatedValues.depositValue.toFixed(4)} oUSD`}
            />
            <OverviewItem
              label="Collateral Ratio:"
              value={`${calculatedValues.effectiveCollateralRatio.toFixed(2)}%`}
              newValue={`${collateralRatio}%`}
            />
            <OverviewItem
              label="Max Borrow:"
              value={`${calculatedValues.maxBorrow.toFixed(4)} oUSD`}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Repayment and Fees
            </Typography>
            <OverviewItem
              label="Amount to repay:"
              value={`${calculatedValues.currentBorrow.toFixed(4)} oUSD`}
            />
            <OverviewItem
              label="Gas:"
              value={`${toBalance(BigInt((simResponse as any)?.minResourceFee ?? 0), 7)} XLM`}
              icon={<GasIcon />}
            />
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
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

const GasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 17H19V10C19 9.73478 18.8946 9.48043 18.7071 9.29289C18.5196 9.10536 18.2652 9 18 9H16C15.7348 9 15.4804 9.10536 15.2929 9.29289C15.1054 9.48043 15 9.73478 15 10V17H2C1.73478 17 1.48043 17.1054 1.29289 17.2929C1.10536 17.4804 1 17.7348 1 18V21C1 21.2652 1.10536 21.5196 1.29289 21.7071C1.48043 21.8946 1.73478 22 2 22H22C22.2652 22 22.5196 21.8946 22.7071 21.7071C22.8946 21.5196 23 21.2652 23 21V18C23 17.7348 22.8946 17.4804 22.7071 17.2929C22.5196 17.1054 22.2652 17 22 17ZM13 5V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2H4C3.73478 2 3.48043 2.10536 3.29289 2.29289C3.10536 2.48043 3 2.73478 3 3V15H13V5Z"
      fill="currentColor"
    />
  </svg>
);

const OverviewItem: React.FC<OverviewItemProps> = ({ label, value, oldValue, newValue, icon }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
      {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
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
