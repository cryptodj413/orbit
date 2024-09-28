// components/borrow/TransactionOverview.tsx
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

interface TransactionOverviewProps {
  xlmAmount: string;
  oUsdAmount: string;
  collateralRatio: number;
}

const TransactionOverview: React.FC<TransactionOverviewProps> = ({
  xlmAmount,
  oUsdAmount,
  collateralRatio,
}) => (
  <Box
    sx={{
      p: 3,
      color: 'white',
      background:
        'linear-gradient(360deg, rgba(226, 226, 226, 0.1024) -0.02%, rgba(0, 0, 0, 0.1024) 99.98%)',
    }}
  >
    <Typography variant="h6" gutterBottom>
      Transaction Overview
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography variant="subtitle2">Collateral Details</Typography>
        <OverviewItem label="Deposit:" value={`${xlmAmount} XLM`} />
        <OverviewItem
          label="Deposit Value:"
          value={`$${(parseFloat(xlmAmount || '0') * 0.08988).toFixed(2)} USD`}
        />
        <OverviewItem label="Collateral Ratio:" value={`${collateralRatio}%`} />
        <OverviewItem
          label="Max Borrow:"
          value={`${(parseFloat(oUsdAmount || '0') * 2).toFixed(2)} oUSD`}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle2">Repayment and Fees</Typography>
        <OverviewItem
          label="Amount to repay:"
          value={`${(parseFloat(oUsdAmount || '0') * 1.04).toFixed(2)} oUSD`}
        />
        <OverviewItem label="Gas:" value="0.03 XLM" />
      </Grid>
    </Grid>
  </Box>
);

const OverviewItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export default TransactionOverview;
