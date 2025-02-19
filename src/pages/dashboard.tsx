import React from 'react';
import Link from 'next/link';
import { Typography, Box, Button, Grid } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import RemoveIcon from '@mui/icons-material/Remove';
import { Asset, rpc } from '@stellar/stellar-sdk';
import {
  ContractErrorType,
  parseError,
  PoolContractV1,
  PoolClaimArgs,
  PositionsEstimate,
} from '@blend-capital/blend-sdk';
import {
  usePool,
  usePoolOracle,
  usePoolUser,
  usePoolMeta,
  usePoolEmissions,
  useTokenBalance,
  useHorizonAccount,
  useSimulateOperation,
} from '../hooks/api';
import { bigIntToFloat, toBalance, toPercentage } from '../utils/formatter';
import { BLND_ASSET } from '../utils/token_display';
import { requiresTrustline } from '../utils/horizon';
import { TokenType } from '../interfaces';
import { useWallet } from '../contexts/wallet';
import FlameIcon from '../components/dashboard/FlameIcon';
import StellarIcon from '../../public/icons/tokens/xlm.svg';
import OusdIcon from '../../public/icons/tokens/ousd.svg';

const tokens = [
  {
    code: 'XLM',
    contract: process.env.NEXT_PUBLIC_COLLATERAL_ASSET || '',
    icon: '/icons/tokens/xlm.svg',
    decimals: 7,
    asset: new Asset('XLM', 'GAXHVI4RI4KFLWWEZSUNLDKMQSKHRBCFB44FNUZDOGSJODVX5GAAKOMX'),
  },
  {
    code: 'OUSD',
    contract: process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '',
    icon: '/icons/tokens/ousd.svg',
    decimals: 7,
    asset: new Asset('OUSD', 'GAXHVI4RI4KFLWWEZSUNLDKMQSKHRBCFB44FNUZDOGSJODVX5GAAKOMX'),
  },
];

const ColItem = ({ item, val }) => {
  return (
    <div className="flex flex-col font-medium">
      <p className="text-base text-[#d4d4d4]">{item}</p>
      <p className="text-xl">{val}</p>
    </div>
  );
};

const PositionItem = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between bg-[#2051f26b] rounded-lg px-1 py-3">
        <p className="text-base font-bold">Your supplied positions</p>
        <p className="text-base font-light">
          Total Supplied: <span className="text-lg font-bold">$612.79</span>
        </p>
      </div>
      <div className="flex justify-between">
        <ColItem item="Asset" val="XLM" />
        <ColItem item="Balance" val="3.06k" />
        <ColItem item="APR" val="151.09%" />
        <button className="w-40 py-2 px-6 bg-[#94fd0240] font-medium text-xl rounded-lg">
          Withdraw +
        </button>
      </div>
    </div>
  );
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
        onClick={() => {}}
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

const getTokenInfo = (contractId: string): TokenType | undefined => {
  return tokens.find((token) => token.contract === contractId);
};

const Dashboard = () => {
  const { walletAddress, connected, createTrustlines } = useWallet();

  const { data: horizonAccount } = useHorizonAccount();
  const { data: account, refetch: refechAccount } = useHorizonAccount();

  const poolId = process.env.NEXT_PUBLIC_POOL;
  const { data: poolMeta } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: poolEmissions } = usePoolEmissions(pool);
  const { data: userPoolData, refetch: refetchPoolUser } = usePoolUser(pool);

  const { data: stellarBalance } = useTokenBalance(
    tokens[0].contract,
    tokens[0].asset,
    horizonAccount,
  );
  const { data: orbitalBalance } = useTokenBalance(
    tokens[1].contract,
    tokens[1].asset,
    horizonAccount,
  );

  const poolContract = poolId ? new PoolContractV1(poolId) : undefined;

  const { emissions, claimedTokens } =
    userPoolData && pool && poolEmissions
      ? userPoolData.estimateEmissions(pool, poolEmissions)
      : { emissions: 0, claimedTokens: [] };

  const claimArgs: PoolClaimArgs = {
    from: walletAddress,
    reserve_token_ids: claimedTokens,
    to: walletAddress,
  };

  const sim_op = poolContract && walletAddress !== '' ? poolContract.claim(claimArgs) : '';

  const {
    data: simResult,
    isLoading,
    refetch: refetchSim,
  } = useSimulateOperation(sim_op, claimedTokens.length > 0 && sim_op !== '' && connected);

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
      const price = poolOracle.getPriceFloat(assetId);

      totalCollateral += collateralAmount * price;
      totalLiabilities += liabilityAmount * price;
    });

    return {
      totalCollateral,
      totalLiabilities,
    };
  }, [pool, poolOracle, userPoolData]);

  const balancesData = React.useMemo(() => {
    if (!pool || !userPoolData) return [];

    const balances = [];
    pool.reserves.forEach((reserve, assetId) => {
      const collateral = userPoolData.getCollateralFloat(reserve);
      const supply = userPoolData.getSupplyFloat(reserve);
      const dTokens = userPoolData.getLiabilityDTokens(reserve);
      // if (collateral > 0 || supply > 0) {
      const tokenInfo = getTokenInfo(assetId);
      balances.push({
        label: tokenInfo?.code || assetId,
        value: `${toBalance(collateral + supply)} ${tokenInfo?.code || assetId}`,
        borrowApr: toPercentage(reserve.borrowApr),
        supplyApr: toPercentage(reserve.supplyApr),
      });
      // }
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

  async function handleCreateTrustlineClick() {
    if (connected) {
      await createTrustlines([BLND_ASSET]);
      refechAccount();
    }
  }

  const userEst = poolOracle
    ? PositionsEstimate.build(pool, poolOracle, userPoolData.positions)
    : undefined;
  const percent = Number(userEst?.borrowLimit.toFixed(2)) * 100;
  const hasBLNDTrustline = !requiresTrustline(account, BLND_ASSET);
  const isRestore =
    isLoading === false && simResult !== undefined && rpc.Api.isSimulationRestore(simResult);
  const isError =
    isLoading === false && simResult !== undefined && rpc.Api.isSimulationError(simResult);
  const isTrustline = hasBLNDTrustline && !isRestore && !isError;

  if (!walletAddress) {
    return <ConnectWallet />;
  }

  return (
    <div className="mx-5 my-2 backdrop-blur-[130px] bg-opacity-20">
      
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col gap-4 w-1/2">
          <div className="">
            <div className="text-xl font-bold mb-4">Overview</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p>Total Collateral Deposited:</p>
                <p className="font-bold">{toBalance(positionEstimates?.totalCollateral)}USD</p>
              </div>
              <div className="flex justify-between">
                <p>Total Debt Outstanding:</p>
                <p className="font-bold">
                  {toBalance(positionEstimates?.totalLiabilities)}
                  USD
                </p>
              </div>
            </div>
          </div>
          <div className="">
            <div className="text-xl font-bold mb-4">Balance</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p>Stellar Lumens:</p>
                <div className="flex items-center">
                  <p className="font-bold">{Number(bigIntToFloat(stellarBalance)).toFixed(2)}</p>
                  &nbsp;
                  <img src={StellarIcon.src} className="w-4 h-4" />
                </div>
              </div>
              <div className="flex justify-between">
                <p>Orbital US Dollar:</p>
                <div className="flex items-center">
                  <p className="font-bold">{Number(bigIntToFloat(orbitalBalance)).toFixed(2)}</p>
                  &nbsp;
                  <img src={OusdIcon.src} className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-1/2">
          <div className="text-xl font-bold mb-4">My Positions</div>
          <div className="flex gap-4">
            <div className="flex flex-col font-medium">
              <p className="text-base font-light">Net APR</p>
              <p className="text-base font-medium">{toPercentage(userEst?.netApr)}</p>
            </div>
            <div className="flex flex-col font-medium">
              <p className="text-base font-light">Borrow Capacity</p>
              <p className="text-base font-medium">{`$${toBalance(userEst?.borrowCap)}`}</p>
            </div>
            <div className="flex items-baseline">
              <div
                className="rounded-full w-12 h-12 flex items-center justify-center"
                style={{
                  background: `conic-gradient(blue 0deg, blue ${percent * 3.6}deg, white ${
                    percent * 3.6
                  }deg)`,
                }}
              >
                <div className="bg-black rounded-full w-9 h-9"></div>
              </div>
              <p className="text-[13px]">{percent}</p>
            </div>
          </div>

          <div className="bg-[#2050F249] rounded-[8px] px-4 py-2 flex items-center justify-between mt-[28px]">
            <FlameIcon />
            <div className="flex flex-col cursor-pointer" onClick={handleCreateTrustlineClick}>
              <p className="text-base font-light">Claim Pool Emissions</p>
              <p className="text-xl font-medium">{isTrustline ? `0 BLND` : `Add Blnd TrustLine`}</p>
            </div>
            <ArrowRightAltIcon />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between bg-[#2051f26b] rounded-lg px-1 py-3">
            <p className="text-base font-bold">Your supplied positions</p>
            <p className="text-base font-light">
              Total Supplied:{' '}
              <span className="text-lg font-bold">
                ${toBalance(positionEstimates?.totalCollateral)}
              </span>
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col font-medium">
              <p className="text-base text-[#d4d4d4]">Asset</p>
              <div className="flex items-center gap-2">
                <img src={StellarIcon.src} className="w-8 h-8" />
                <p className="text-xl">XLM</p>
              </div>
            </div>
            <ColItem item="Balance" val={balancesData[0] ? balancesData[0].value : '--'} />
            <ColItem item="APR" val={balancesData[0] ? balancesData[0].supplyApr : '--'} />
            <Link href="/withdraw">
              <button className="w-40 py-2 px-6 bg-[#94fd0245] font-medium text-xl rounded-lg">
                Withdraw +
              </button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between bg-[#2051f26b] rounded-lg px-1 py-3">
            <p className="text-base font-bold">Your borrowed positions</p>
            <p className="text-base font-light">
              Total Borrowed:{' '}
              <span className="text-lg font-bold">
                ${toBalance(positionEstimates?.totalLiabilities)}
              </span>
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col font-medium">
              <p className="text-base text-[#d4d4d4]">Asset</p>
              <div className="flex items-center gap-2">
                <img src={OusdIcon.src} className="w-8 h-8" />
                <p className="text-xl">OUSD</p>
              </div>
            </div>
            <ColItem item="Balance" val={toBalance(positionEstimates?.totalLiabilities) + ' OUSD'} />
            <ColItem item="APR" val={balancesData[1] ? balancesData[1].borrowApr : '--'} />
            <Link href="/repay">
              <button className="w-40 py-2 px-6 bg-[#67269cb2] font-medium text-xl rounded-lg flex items-center justify-center">
                Repay <RemoveIcon />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
