import React from 'react';
import { Typography, Box, Button, Grid } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { usePool, usePoolOracle, usePoolUser } from '../hooks/api';
import { toBalance, toPercentage } from '../utils/formatter';
import { TokenType } from '../interfaces';
import { useWallet } from '../contexts/wallet';
import FlameIcon from '../components/dashboard/FlameIcon';
import StellarIcon from '../../public/icons/tokens/xlm.svg';
import OusdIcon from '../../public/icons/tokens/ousd.svg';
import UsdcIcon from '../../public/icons/tokens/Usdc.svg'

const ColItem = ({ item, val }) => {
  return (
    <div className="flex flex-col font-medium">
      <p className="text-base">{item}</p>
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
        <button className="w-40 py-2 px-6 bg-[#94fd0295] font-medium text-xl rounded-lg">
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

const Dashboard = () => {
  const { walletAddress } = useWallet();
  if (!walletAddress) {
    return <ConnectWallet />;
  }

  return (
    <div className="mx-5 my-2">
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col gap-4 w-1/2">
          <div className="">
            <div className="text-xl font-bold mb-4">Overview</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p>Total Collateral Deposited:</p>
                <p className="font-bold">315.16USD</p>
              </div>
              <div className="flex justify-between">
                <p>Total Debt Outstanding:</p>
                <p className="font-bold">20.15%</p>
              </div>
            </div>
          </div>
          <div className="">
            <div className="text-xl font-bold mb-4">Balance</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p>Stellar Lumens:</p>
                <div className="flex items-center">
                  <p className="font-bold">1562XLM</p>&nbsp;
                  <img src={StellarIcon.src} className="w-4 h-4" />
                </div>
              </div>
              <div className="flex justify-between">
                <p>Orbital US Dollar:</p>
                <div className="flex items-center">
                  <p className="font-bold">102.78oUSD</p>&nbsp;
                  <img src={OusdIcon.src} className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-1/2">
          <div className="text-xl font-bold mb-4">My Positions</div>
          <div className="flex gap-5">
            <div className="flex flex-col font-medium">
              <p className="text-base font-light">Net APR</p>
              <p className="text-base font-medium">130.68%</p>
            </div>
            <div className="flex flex-col font-medium">
              <p className="text-base font-light">Borrow Capacity</p>
              <p className="text-base font-medium">$478.45</p>
            </div>
            <div className="flex items-baseline">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
                <div className="bg-black rounded-full w-9 h-9"></div>
              </div>
              <p className="text-[13px]">15</p>
            </div>
          </div>

          <div className="bg-[#ffffff44] rounded-[8px] px-4 py-2 flex items-center justify-between mt-[22px]">
            <FlameIcon />
            <div className="flex flex-col">
              <p className="text-base font-light">Claim Pool Emissions</p>
              <p className="text-xl font-medium">0 Blend</p>
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
              Total Supplied: <span className="text-lg font-bold">$612.79</span>
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col font-medium">
              <p className="text-base">Asset</p>
              <div className="flex items-center gap-2">
                <img src={OusdIcon.src} className='w-8 h-8' />
                <p className="text-xl">XLM</p>
              </div>
            </div>
            <ColItem item="Balance" val="3.06k" />
            <ColItem item="APR" val="151.09%" />
            <button className="w-40 py-2 px-6 bg-[#94fd0295] font-medium text-xl rounded-lg">
              Withdraw +
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between bg-[#2051f26b] rounded-lg px-1 py-3">
            <p className="text-base font-bold">Your supplied positions</p>
            <p className="text-base font-light">
              Total Borrowed: <span className="text-lg font-bold">$80.21</span>
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col font-medium">
              <p className="text-base">Asset</p>
              <div className="flex items-center gap-2">
                <img src={UsdcIcon.src} className='w-8 h-8' />
                <p className="text-xl">USDC</p>
              </div>
            </div>
            <ColItem item="Balance" val="3.06k" />
            <ColItem item="APR" val="151.09%" />
            <button className="w-40 py-2 px-6 bg-[#fd02d385] font-medium text-xl rounded-lg">
              Repay +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
