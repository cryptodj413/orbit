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
import { Positions, PoolUser, PositionsEstimate, SubmitArgs, RequestType, PoolContractV1 } from '@blend-capital/blend-sdk';
import { rpc } from '@stellar/stellar-sdk';
import OverViewBox from './OverViewBox';
import {
  useBackstop,
  usePool,
  usePoolMeta,
  usePoolEmissions,
  usePoolOracle,
  usePoolUser,
  useTokenMetadata,
} from '../../hooks/api';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../../hooks/debounce';
import { NOT_BLEND_POOL_ERROR_MESSAGE } from '../../hooks/types';
import { toBalance, toCompactAddress, toPercentage } from '../../utils/formatter';
import { estimateEmissionsApr } from '../../utils/math';
import { scaleInputToBigInt } from '../../utils/scval';
import { useWallet } from '../../contexts/wallet';

const Withdraw: NextPage = () => {
  const [selected, setSelected] = React.useState('XLM');
  const [simResponse, setSimResponse] = useState<rpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<Positions>();
  const { connected, walletAddress, txType } = useWallet()

  // const handleSubmitTransaction = async (sim: boolean) => {
  //   if (toWithdrawSubmit && connected && poolMeta && reserve) {
  //     let submitArgs: SubmitArgs = {
  //       from: walletAddress,
  //       to: walletAddress,
  //       spender: walletAddress,
  //       requests: [
  //         {
  //           amount: scaleInputToBigInt(toWithdrawSubmit, decimals),
  //           request_type: RequestType.WithdrawCollateral,
  //           address: reserve.assetId,
  //         },
  //       ],
  //     };
  //     return await poolSubmit(poolMeta, submitArgs, sim);
  //   }
  // };

  // useDebouncedState(toWithdrawSubmit, RPC_DEBOUNCE_DELAY, txType, async () => {
  //   setSimResponse(undefined);
  //   setParsedSimResult(undefined);
  //   let response = await handleSubmitTransaction(true);
  //   if (response) {
  //     setSimResponse(response);
  //     if (rpc.Api.isSimulationSuccess(response)) {
  //       setParsedSimResult(parseResult(response, PoolContractV1.parsers.submit));
  //     }
  //   }
  //   setLoadingEstimate(false);
  // });

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  const poolId = process.env.NEXT_PUBLIC_POOL || '';
  const assetId =
    selected === 'XLM'
      ? process.env.NEXT_PUBLIC_COLLATERAL_ASSET || ''
      : process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '';

  const { data: poolMeta, error: poolError } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolEmissions } = usePoolEmissions(pool);
  const { data: poolUser } = usePoolUser(pool);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: backstop } = useBackstop(poolMeta?.version);
  const { data: tokenMetadata } = useTokenMetadata(assetId);
  const reserve = pool?.reserves.get(assetId);
  const tokenSymbol = tokenMetadata?.symbol ?? toCompactAddress(assetId);

  const currentDeposit = reserve && poolUser ? poolUser.getCollateralFloat(reserve) : undefined;
  const reserveEmissions = poolEmissions?.find((e) => e.assetId === reserve?.assetId);
  const emissionsPerAsset =
    reserveEmissions?.supplyEmissions !== undefined && reserve
      ? reserveEmissions.supplyEmissions.emissionsPerYearPerToken(
          reserve.totalSupply(),
          reserve.config.decimals,
        )
      : 0;
  const oraclePrice = reserve ? poolOracle?.getPriceFloat(reserve.assetId) : 0;
  const emissionApr =
    backstop && emissionsPerAsset > 0 && oraclePrice
      ? estimateEmissionsApr(emissionsPerAsset, backstop.backstopToken, oraclePrice)
      : undefined;

  const assetToBase = poolOracle?.getPriceFloat(assetId);
  const decimals = reserve?.config.decimals ?? 7;
  const newPoolUser = parsedSimResult && new PoolUser(walletAddress, parsedSimResult, new Map());
  const newPositionsEstimate =
    pool && parsedSimResult && poolOracle
      ? PositionsEstimate.build(pool, poolOracle, parsedSimResult)
      : undefined;
  const nextBorrowCap = newPositionsEstimate?.borrowCap;
  const nextBorrowLimit =
    newPositionsEstimate && Number.isFinite(newPositionsEstimate?.borrowLimit)
      ? newPositionsEstimate?.borrowLimit
      : 0;
  
  const data = [
    { label: 'Supply APR', value: reserve?.supplyApr },
    { label: 'Collateral Fator', value: toPercentage(reserve?.getCollateralFactor()) },
    { label: 'Total Supplied', value: toBalance(reserve?.totalSupplyFloat()) },
  ];

  const gasFee = `${toBalance(BigInt((simResponse as any)?.minResourceFee ?? 0), decimals)} XLM`;
  const totalSupply = `${toBalance(newPoolUser?.getCollateralFloat(reserve))} ${selected}`;
  const borrowCapacity = `$${toBalance(nextBorrowCap)}`
  const borrowLimit = toPercentage(nextBorrowLimit)
  console.log(simResponse)
  console.log(gasFee, totalSupply, borrowCapacity, borrowLimit)

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
        <OverViewBox assetToBase={assetToBase} selected={selected} maxVal={currentDeposit} gas={gasFee} total={totalSupply} capacity={borrowCapacity} limit={borrowLimit}/>
      </Grid>
    </div>
  );
};

export default Withdraw;
