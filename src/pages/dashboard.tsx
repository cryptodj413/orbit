import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CurrencyExchange, Calculate, History } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { NextPage } from 'next';
import DashboardCard from '../components/dashboard/DashboardCard';
import StyledGrid from '../components/common/StyledGrid';

const GaugeChart = ({ value }) => {
  const data = [{ value: 100 }];
  const RADIAN = Math.PI / 180;
  const cx = 100;
  const cy = 100;
  const radius = 80;

  const needle = (value, cx, cy, radius) => {
    const theta = (1 - value / 100) * 180;
    const x = cx + radius * Math.cos(-theta * RADIAN);
    const y = cy + radius * Math.sin(-theta * RADIAN);

    return <circle cx={x} cy={y} r={4} fill="#fff" stroke="#030615" strokeWidth={2} />;
  };

  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#F44336" />
          </linearGradient>
        </defs>
        <Pie
          data={data}
          cx={cx}
          cy={cy}
          startAngle={180}
          endAngle={0}
          innerRadius={radius - 10}
          outerRadius={radius}
          fill="url(#riskGradient)"
          paddingAngle={0}
          dataKey="value"
        />
        {needle(value, cx, cy, radius - 15)}
      </PieChart>
    </ResponsiveContainer>
  );
};

const Dashboard: NextPage = () => {
  const riskValue = 20; // Example risk value (0-100)

  return (
    <DashboardCard>
      <StyledGrid>
        {/* First row */}
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'start', color: 'white' }}>
            <Typography variant="h6">Overview</Typography>
            <Typography variant="subtitle2">Total Collateral Deposited: 315.16 USD</Typography>
            <Typography variant="subtitle2">Total Debt Outstanding: 20.15%</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'start', color: 'white' }}>
            <Typography variant="h6">My Positions</Typography>
            <Typography variant="subtitle2">Total Collateral Deposited: 315.16 USD</Typography>
            <Typography variant="subtitle2">Total Debt Outstanding: 20.15%</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'start', color: 'white' }}>
            <Typography variant="h6">Balances</Typography>
            <Typography variant="subtitle2">Stellar Lumens 1,562 XLM</Typography>
            <Typography variant="subtitle2">Orbital US Dollar 102.78 oUSD</Typography>
          </Box>
        </Grid>
      </StyledGrid>

      <Button
        variant="contained"
        fullWidth
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
    </DashboardCard>
  );
};

export default Dashboard;
