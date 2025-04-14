import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Grid, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import OverViewBox from '../components/repay/OverViewBox';
import {
  usePool,
  usePoolMeta,
  usePoolOracle,
  usePoolUser,
  useTokenBalance,
  useTokenMetadata,
  useHorizonAccount,
} from '../hooks/api';
import { toBalance, toPercentage } from '../utils/formatter';
import {
  NEXT_PUBLIC_POOL,
  NEXT_PUBLIC_COLLATERAL_ASSET,
  NEXT_PUBLIC_STABLECOIN_ASSET,
} from '../config/constants';

const Repay: NextPage = () => {
  const [selected, setSelected] = useState<string>('OUSD');
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const poolId = NEXT_PUBLIC_POOL || '';
  const assetId =
    selected === 'XLM' ? NEXT_PUBLIC_COLLATERAL_ASSET || '' : NEXT_PUBLIC_STABLECOIN_ASSET || '';

  const poolMeta = usePoolMeta(poolId)?.data || null;
  const pool = usePool(poolMeta)?.data || null;
  const poolUser = usePoolUser(pool)?.data || null;
  const tokenMetadata = useTokenMetadata(assetId)?.data || null;
  const poolOracle = usePoolOracle(pool)?.data || null;
  const horizonAccount = useHorizonAccount()?.data || null;

  const reserve = pool?.reserves.get(assetId) || null;
  const tokenBalance =
    useTokenBalance(
      reserve?.assetId ?? undefined, // Ensure it's either `Asset` or `undefined`
      tokenMetadata?.asset ?? undefined, // Ensure it's either `Asset` or `undefined`
      horizonAccount ?? undefined, // Ensure it's either correct type or `undefined`
      !!reserve,
    )?.data || null;

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  const currentDebt = reserve && poolUser ? poolUser.getLiabilitiesFloat(reserve) : undefined;
  const assetToBase = poolOracle?.getPriceFloat(assetId);

  const data = [
    { label: 'Borrow APR', value: toPercentage(reserve?.borrowApr) || 0.0 },
    { label: 'Liability Fator', value: toPercentage(reserve?.getLiabilityFactor()) },
    { label: 'Wallet Balance', value: toBalance(tokenBalance, reserve?.config.decimals) },
  ];

  if (!clientReady) return null;

  return (
    <>
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
              <MenuItem value={'OUSD'}>Repay OUSD</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6}>
            <div className="flex mx-8 justify-between text-xl">
              <p>Debt</p>
              <p className="font-bold">
                {toBalance(currentDebt)} {selected}
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
          <OverViewBox assetToBase={assetToBase} selected={selected} maxVal={currentDebt} />
        </Grid>
      </div>
    </>
  );
};

export default Repay;
