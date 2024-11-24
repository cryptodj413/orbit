import React from 'react';
import { Typography, Grid, Box, Button } from '@mui/material';
import { NextPage } from 'next';
import { Icon } from '../components/common/Icon';
import { FlameIcon } from '../components/common/FlameIcon';
import { RightArrowIcon } from '../components/common/RightArrowIcon';

const WithdrawButton = (): JSX.Element => {
  return (
    <Button
      sx={{
        background: 'rgba(150, 253, 2, 0.16)',
        borderRadius: '8px',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '&:hover': {
          backgroundColor: '#96fd0252',
        },
      }}
    >
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontFamily: 'Satoshi_Variable-Bold, Helvetica',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          lineHeight: 'normal',
          letterSpacing: '-0.8px',
          color: 'white',
        }}
      >
        Withdraw
      </Typography>
    </Button>
  );
};

const RepayButton = (): JSX.Element => {
  return (
    <Button
      sx={{
        background: 'rgba(253, 2, 213, 0.16)',
        borderRadius: '8px',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '&:hover': {
          backgroundColor: '#96fd0252',
        },
      }}
    >
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontFamily: 'Satoshi_Variable-Bold, Helvetica',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          lineHeight: 'normal',
          letterSpacing: '-0.8px',
          color: 'white',
        }}
      >
        Repay
      </Typography>
    </Button>
  );
};

const InfoSection = ({ title, items }) => (
  <Grid item xs={6}>
    <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
      {title}
    </Typography>
    {items.map((item, index) => (
      <Typography
        key={index}
        variant="body1"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(255, 255, 255, 0.7)',
          '.value': {
            color: 'white',
            fontWeight: 'bold',
          },
        }}
      >
        <span>{item.label}:</span>
        <span className="value">{item.value}</span>
      </Typography>
    ))}
  </Grid>
);

const Dashboard: NextPage = () => {
  const riskValue = 20; // Example risk value (0-100)

  const overviewData = [
    { label: 'Total Collateral Deposited', value: '315.16USD' },
    { label: 'Total Debt Outstanding', value: '20.15%' },
  ];

  const positionsData = [{ label: 'Total Collateral Deposited', value: '315.16USD' }];

  const balancesData = [
    { label: 'Stellar Lumens', value: '1,562 XLM' },
    { label: 'Orbital US Dollar', value: '102.78 oUSD' },
  ];

  return (
    <Grid container spacing={4}>
      <Grid container item spacing={4}>
        <InfoSection title="Overview" items={overviewData} />
        <InfoSection title="My Positions" items={positionsData} />
      </Grid>
      <Grid container item spacing={4}>
        <InfoSection title="Balances" items={balancesData} />
        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FlameIcon />
          <Box>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Claim Pool Emissions
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              0 BLEND
            </Typography>
          </Box>
          <RightArrowIcon />
        </Grid>
      </Grid>

      <Grid container item spacing={4}>
        <Grid item xs={3}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Asset
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <img
              src={'/icons/tokens/xlm.svg'}
              alt={'XLM'}
              width="30px"
              height="30px"
              style={{ borderRadius: '100px' }}
            />
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              XLM
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Balance
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            3.06k
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            APR
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            151.09%
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <WithdrawButton />
        </Grid>
      </Grid>
      <Grid container item spacing={4}>
        <Grid item xs={3}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Asset
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <img
              src={'/icons/tokens/xlm.svg'}
              alt={'XLM'}
              width="30px"
              height="30px"
              style={{ borderRadius: '100px' }}
            />
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              XLM
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Balance
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            3.06k
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            APR
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            151.09%
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <RepayButton />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
