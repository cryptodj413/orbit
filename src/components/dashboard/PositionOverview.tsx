import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CurrencyExchange, Calculate, History } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#030615',
  borderRadius: '25px',
  overflow: 'hidden',
  color: 'white',
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& > .MuiGrid-item': {
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    padding: theme.spacing(2),
    '&:last-child': {
      borderRight: 'none',
    },
  },
  '& > .MuiGrid-item:nth-of-type(2)': {
    borderRight: 'none',
  },
  '& > .MuiGrid-item:nth-last-of-type(-n+2)': {
    borderBottom: 'none',
  },
  borderRadius: '17px',
  border: '1px solid rgba(255, 255, 255, 0.32)',
}));

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

const PositionOverview: React.FC = () => {
  const riskValue = 20; // Example risk value (0-100)

  return (
    <StyledCard sx={{ width: '100%', maxWidth: '680px', m: 'auto' }}>
      <CardContent>
        <StyledGrid container>
          {/* Overview Section */}
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Total Collateral Value:</Typography>
              <Typography variant="body1">315.16 USD</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Total Borrowed Value:</Typography>
              <Typography variant="body1">20.15%</Typography>
            </Box>
          </Grid>

          {/* Rewards Section */}
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Rewards
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="h4">33.13 USD</Typography>
            </Box>
          </Grid>

          {/* Balances Section */}
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Balances
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Stellar Lumens:</Typography>
              <Typography variant="body1">1.562 XLM</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Orbital US Dollar:</Typography>
              <Typography variant="body1">102.78 oUSD</Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Portfolio's Risk
            </Typography>
            <GaugeChart value={riskValue} />
            <Typography variant="body2" align="center" mt={1}>
              Moderate to Low Risk
            </Typography>
          </Grid>

          {/* Explore Section */}
          <Grid item xs={6}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<CurrencyExchange />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              Explore
            </Button>
            <Typography variant="body2" color="text.secondary">
              Best performing assets
            </Typography>
          </Grid>

          {/* Repayment Calculator Section */}
          <Grid item xs={6}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<Calculate />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              Repayment Calculator
            </Button>
            <Typography variant="body2" color="text.secondary">
              Active Loans
            </Typography>
          </Grid>

          {/* Your Positions Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Your positions
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Net APY</Typography>
              <Typography variant="body1">0.00%</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Borrow Capacity</Typography>
              <Typography variant="body1">$0.00</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#2050F2' }}
            >
              Claim Pool Rewards: 100 BLND
            </Button>
          </Grid>

          {/* History Section */}
          <Grid item xs={12}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<History />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              History
            </Button>
          </Grid>
        </StyledGrid>
      </CardContent>
    </StyledCard>
  );
};

export default PositionOverview;
