import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Link from 'next/link';
import { Grid, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import OverViewBox from '../components/withdraw/OverViewBox';
import { usePool, usePoolMeta, usePoolOracle, usePoolUser } from '../hooks/api';
import { toBalance, toPercentage } from '../utils/formatter';
import {
  NEXT_PUBLIC_POOL,
  NEXT_PUBLIC_COLLATERAL_ASSET,
  NEXT_PUBLIC_STABLECOIN_ASSET,
} from '../config/constants';

const Withdraw: NextPage = () => {
  const router = useRouter()
  const [selected, setSelected] = React.useState(router.pathname === '/withdraw' ? 'XLM' : 'OUSD');

  const poolId = NEXT_PUBLIC_POOL || '';
  const assetId =
    selected === 'XLM' ? NEXT_PUBLIC_COLLATERAL_ASSET || '' : NEXT_PUBLIC_STABLECOIN_ASSET || '';

  const { data: poolMeta } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolUser } = usePoolUser(pool);
  const { data: poolOracle } = usePoolOracle(pool);
  const reserve = pool?.reserves.get(assetId);

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  const currentDeposit = reserve && poolUser ? poolUser.getCollateralFloat(reserve) : undefined;
  const assetToBase = poolOracle?.getPriceFloat(assetId);

  const data = [
    { label: 'Supply APR', value: `${reserve?.supplyApr?.toFixed(2) || 0.0}%` },
    { label: 'Collateral Fator', value: toPercentage(reserve?.getCollateralFactor()) },
    { label: 'Total Supplied', value: toBalance(reserve?.totalSupplyFloat()) },
  ];

  return (
    <div className="border rounded-lg">
      <Grid container spacing={2} display="flex" justifyContent="center" alignItems="center">
        <Grid item xs={2} display="flex" justifyContent="center" alignItems="center">
          <Tooltip title="dashboard" placement="top">
            <Link href="/dashboard">
              <button className="w-14 h-14 bg-[#0211a9] font-medium text-xl rounded-full">
                <ArrowBack />
              </button>
            </Link>
          </Tooltip>
        </Grid>
        <Grid item xs={4}>
          <Select
            value={selected}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{
              width: '100%',
              margin: '16px',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
            }}
          >
            <MenuItem value={'XLM'}>Withdraw XLM</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={6}>
          <div className="flex mx-8 justify-between text-xl">
            <p>Available</p>
            <p className="font-bold">
              {currentDeposit} {selected}
            </p>
          </div>
        </Grid>
      </Grid>
      <Grid container display="flex" justifyContent="center" alignItems="center">
        {data.map((item, index) => (
          <Grid
            key={index}
            item
            xs={4}
            sx={{
              borderRight: index !== data.length - 1 ? '1px solid #E0E0E0' : 'none',
              borderTop: '1px solid #E0E0E0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBlock: '16px',
            }}
          >
            <p className="font-light">{item.label}</p>
            <p className="font-semibold">{item.value}</p>
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12} sx={{ borderTop: '1px solid #E0E0E0' }}>
        <OverViewBox assetToBase={assetToBase} selected={selected} maxVal={currentDeposit} />
      </Grid>
    </div>
  );
};

export default Withdraw;
