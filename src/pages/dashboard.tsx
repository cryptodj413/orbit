import React from 'react';
import { Typography, Grid, Box, Button } from '@mui/material';
import { usePool, usePoolOracle, usePoolUser } from '../hooks/api';
import { toBalance, toPercentage } from '../utils/formatter';
import { TokenType } from '../interfaces';
import { useWallet } from '../contexts/wallet';

const ActionButton = ({ variant = 'withdraw', onClick }) => {
  const getButtonStyles = () => ({
    background: variant === 'withdraw' ? 'rgba(150, 253, 2, 0.16)' : 'rgba(253, 2, 213, 0.16)',
    borderRadius: '8px',
    color: 'white',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: variant === 'withdraw' ? '#96fd0252' : '#fd02d552',
    },
  });

  return (
    <Button sx={getButtonStyles()} onClick={onClick}>
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
          lineHeight: 'normal',
          letterSpacing: '-0.8px',
          color: 'white',
        }}
      >
        {variant === 'withdraw' ? 'Withdraw' : 'Repay'}
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

const getTokenInfo = (contractId: string): TokenType | undefined => {
  return tokens.find((token) => token.contract === contractId);
};

const ConnectWallet = () => {
  const { connect } = useWallet();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
        padding: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          letterSpacing: '-0.8px',
        }}
      >
        Connect Your Wallet
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          maxWidth: '460px',
          marginBottom: 2,
        }}
      >
        Connect your wallet to view your positions, manage your assets, and interact with the
        protocol
      </Typography>
      <Button
        onClick={connect}
        sx={{
          background: 'rgba(150, 253, 2, 0.16)',
          borderRadius: '8px',
          color: 'white',
          padding: '12px 24px',
          '&:hover': {
            backgroundColor: '#96fd0252',
          },
          fontWeight: 'bold',
          fontSize: '1.1rem',
        }}
      >
        Connect Wallet
      </Button>
    </Box>
  );
};

const Dashboard = () => {
  const { walletAddress } = useWallet();
  if (!walletAddress) {
    return <ConnectWallet />;
  }
  const poolId = process.env.NEXT_PUBLIC_BLND_POOL;
  const { data: pool } = usePool(poolId);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: userPoolData } = usePoolUser(pool);

  const { emissions, claimedTokens } = React.useMemo(() => {
    if (!userPoolData || !pool) {
      return { emissions: 0, claimedTokens: [] };
    }
    return userPoolData.estimateEmissions(pool);
  }, [userPoolData, pool]);

  const positionEstimates = React.useMemo(() => {
    if (!poolOracle || !pool || !userPoolData) {
      return null;
    }

    let totalCollateral = 0;
    let totalLiabilities = 0;

    // Calculate total collateral and liabilities
    pool.reserves.forEach((reserve, assetId) => {
      const collateralAmount = userPoolData.getCollateralFloat(reserve);
      const liabilityAmount = userPoolData.getLiabilitiesFloat(reserve);
      const price = poolOracle.getPriceFloat(assetId) || 0;

      totalCollateral += collateralAmount * price;
      totalLiabilities += liabilityAmount * price;
    });

    return {
      totalCollateral,
      totalLiabilities,
    };
  }, [pool, poolOracle, userPoolData]);

  const overviewData = [
    {
      label: 'Total Collateral Deposited',
      value: `$${toBalance(positionEstimates?.totalCollateral || 0)}`,
    },
    {
      label: 'Total Debt Outstanding',
      value: `$${toBalance(positionEstimates?.totalLiabilities || 0)}`,
    },
  ];

  const positionsData = [
    {
      label: 'Total Collateral',
      value: `$${toBalance(positionEstimates?.totalCollateral || 0)}`,
    },
    {
      label: 'Total Liabilities',
      value: `$${toBalance(positionEstimates?.totalLiabilities || 0)}`,
    },
  ];

  const balancesData = React.useMemo(() => {
    if (!pool || !userPoolData) return [];

    const balances = [];
    pool.reserves.forEach((reserve, assetId) => {
      const collateral = userPoolData.getCollateralFloat(reserve);
      const supply = userPoolData.getSupplyFloat(reserve);
      if (collateral > 0 || supply > 0) {
        const tokenInfo = getTokenInfo(assetId);
        balances.push({
          label: tokenInfo?.code || assetId,
          value: `${toBalance(collateral + supply)} ${tokenInfo?.code || assetId}`,
        });
      }
    });
    return balances;
  }, [pool, userPoolData]);

  const positions = React.useMemo(() => {
    if (!pool || !userPoolData || !poolOracle) return [];

    const positionsList = [];
    pool.reserves.forEach((reserve, assetId) => {
      const collateral = userPoolData.getCollateralFloat(reserve);
      const supply = userPoolData.getSupplyFloat(reserve);
      const liabilities = userPoolData.getLiabilitiesFloat(reserve);

      if (collateral > 0 || supply > 0 || liabilities > 0) {
        const tokenInfo = getTokenInfo(assetId);
        positionsList.push({
          token: assetId,
          tokenCode: tokenInfo?.code || assetId,
          tokenIcon: tokenInfo?.icon || `/icons/tokens/default.svg`,
          amount: collateral + supply - liabilities,
          price: poolOracle.getPriceFloat(assetId) || 0,
        });
      }
    });
    return positionsList;
  }, [pool, userPoolData, poolOracle]);

  const handleClaim = async () => {
    if (claimedTokens.length > 0) {
      // Implement claim logic here
      // console.log('Claiming tokens:', claimedTokens);
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid container item spacing={4}>
        <InfoSection title="Overview" items={overviewData} />
        <InfoSection title="My Positions" items={positionsData} />
      </Grid>

      <Grid container item spacing={4}>
        <InfoSection title="Balances" items={balancesData} />
        {/* <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FlameIcon />
          <Box onClick={handleClaim} sx={{ cursor: 'pointer' }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Claim Pool Emissions
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              {toBalance(emissions)} BLEND
            </Typography>
          </Box>
          <RightArrowIcon />
        </Grid> */}
      </Grid>

      {positions.map((position, index) => (
        <Grid container item spacing={4} key={position.token}>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Asset
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <img
                src={position.tokenIcon}
                alt={position.tokenCode}
                width="30px"
                height="30px"
                style={{ borderRadius: '100px' }}
              />
              <Typography variant="subtitle1" sx={{ color: 'white' }}>
                {position.tokenCode}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Balance
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              {toBalance(position.amount)}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Value
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              ${toBalance(position.amount * position.price)}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <ActionButton
              variant={position.amount >= 0 ? 'withdraw' : 'repay'}
              onClick={
                () =>
                console.log(
                  `${position.amount >= 0 ? 'Withdrawing' : 'Repaying'} ${position.tokenCode}`,
                )
              }
            />
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default Dashboard;
