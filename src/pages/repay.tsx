import React from 'react';
import { NextPage } from 'next';
import {
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import OverViewBox from '../components/withdraw/OverViewBox';
import {
  useBackstop,
  usePool,
  usePoolMeta,
  usePoolEmissions,
  usePoolOracle,
  usePoolUser,
  useTokenMetadata,
} from '../hooks/api';
import { toBalance, toPercentage } from '../utils/formatter';

const Withdraw: NextPage = () => {
  const [selected, setSelected] = React.useState('XLM');

  const poolId = process.env.NEXT_PUBLIC_POOL || '';
  const assetId =
    selected === 'XLM'
      ? process.env.NEXT_PUBLIC_COLLATERAL_ASSET || ''
      : process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '';

  const { data: poolMeta } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolEmissions } = usePoolEmissions(pool);
  const { data: poolUser } = usePoolUser(pool);
  const { data: poolOracle } = usePoolOracle(pool);
  const reserve = pool?.reserves.get(assetId);

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  const currentDeposit = reserve && poolUser ? poolUser.getCollateralFloat(reserve) : undefined;
  const assetToBase = poolOracle?.getPriceFloat(assetId);

  const data = [
    { label: 'Supply APR', value: `${(reserve?.supplyApr)?.toFixed(2) || 0.00}%` },
    { label: 'Collateral Fator', value: toPercentage(reserve?.getCollateralFactor()) },
    { label: 'Total Supplied', value: toBalance(reserve?.totalSupplyFloat()) },
  ];

  return (
    <div className="border rounded-lg">
      <Grid container spacing={2} display="flex" justifyContent="center" alignItems="center">
        <Grid item xs={6}>
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
            <MenuItem value={'OUSD'}>Withdraw OUSD</MenuItem>
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
        <OverViewBox assetToBase={assetToBase} selected={selected} maxVal={currentDeposit}/>
      </Grid>
    </div>
  );
};

export default Withdraw;
