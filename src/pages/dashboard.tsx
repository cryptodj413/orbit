import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CurrencyExchange, Calculate, History } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { NextPage } from 'next';
import DashboardCard from '../components/dashboard/DashboardCard';
import StyledGrid from '../components/common/StyledGrid';

const Dashboard: NextPage = () => {
  const riskValue = 20; // Example risk value (0-100)

  return (
    <Grid>
      <Grid container>
        <Grid xs={6} item>
          <Typography variant="h5">Overview</Typography>
          <Typography variant="body1">Total Collateral Deposited: 315.16USD</Typography>
          <Typography variant="body1">Total Debt Outstanding: 20.15%</Typography>
        </Grid>
        <Grid xs={6} item>
          <Typography variant="h5">My Positions</Typography>
          <Typography variant="body1">Total Collateral Deposited: 315.16USD</Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="h5">Balances</Typography>
          <Typography variant="body1">Stellar Lumens 1,562 XLM</Typography>
          <Typography variant="body1">Orbital US Dollar 102.78 oUSD</Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={3}>
          <Typography variant="body1">Asset</Typography>
          <Typography variant="subtitle1">XLM</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1">Balance</Typography>
          <Typography variant="subtitle1">3.06k</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1">APR</Typography>
          <Typography variant="subtitle1">151.09%</Typography>
        </Grid>
        <Grid item xs={3}>
          {/* Button */}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
