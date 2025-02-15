import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import AmountBox from './AmountBox';
import OverViewBox from './OverViewBox';
import {
  useBackstop,
  usePool,
  // usePoolMeta,
  usePoolOracle,
  usePoolUser,
} from '../../hooks/api';
//TODO: Get this through config or API

const Withdraw: NextPage = () => {
  const [selected, setSelected] = React.useState('XLM');

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  const data = [
    { label: 'Supply APR', value: '0.00%' },
    { label: 'Collateral Fator', value: '75.00%' },
    { label: 'Total Supplied', value: '179.4k' },
  ];

  const poolId = process.env.NEXT_PUBLIC_POOL || '';
  const assetId = process.env.NEXT_PUBLIC_COLLATERAL_ASSET || '';
  // const { data: poolMeta, error: poolError } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolId);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: poolUser } = usePoolUser(pool);
  const reserves = pool?.reserves;
  console.log(selected);
  const current = reserves?.get(assetId);
  // console.log(current);
  // const collateralAmount = poolUser.getCollateralFloat(current);
  // const liabilityAmount = poolUser.getLiabilitiesFloat(current);
  // const price = poolOracle.getPriceFloat(assetId) || 0;
  // console.log(collateralAmount, liabilityAmount, price)

  return (
    <div className="border rounded-lg">
      <Grid container spacing={2} display="flex" justifyContent="center" alignItems="center">
        <Grid item xs={6}>
          <Select
            value={selected}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{ width: '100%', margin: '16px' }}
          >
            <MenuItem value={'XLM'}>Withdraw XLM</MenuItem>
            <MenuItem value={'OUSD'}>Withdraw OUSD</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={6}>
          <div className="flex mx-8 justify-between text-xl">
            <p>Available</p>
            <p className='font-bold'>{0} {selected}</p>
          </div>
        </Grid>
      </Grid>
      <Grid container display="flex" justifyContent="center" alignItems="center" >
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

      <Grid item xs={12}>
        <AmountBox price={10} selected={selected}/>
      </Grid>
      <Grid item xs={12} sx={{ borderTop: '1px solid #E0E0E0' }}>
        <OverViewBox />
      </Grid>
    </div>
  );
};

export default Withdraw;
