'use client'
 
import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { NextPage } from 'next';
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Grid,
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import {
  SubmitArgs,
  RequestType,
  PoolContractV1,
  parseResult,
  PoolUser,
  Positions,
  PositionsEstimate,
} from '@blend-capital/blend-sdk';
import { rpc } from '@stellar/stellar-sdk';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../../hooks/debounce';
import {
  usePool,
  usePoolMeta,
  usePoolEmissions,
  usePoolOracle,
  useTokenMetadata,
  usePoolUser,
} from '../../hooks/api';
import { scaleInputToBigInt } from '../../utils/scval';
import { estimateEmissionsApr } from '../../utils/math';
import { toBalance, toCompactAddress, toPercentage } from '../../utils/formatter';
import { useWallet } from '../../contexts/wallet';
interface OverviewProps {
  assetToBase: number;
  selected: string;
  maxVal: number;
}

const Item = ({ label, value }) => {
  return (
    <div className="flex justify-between">
      <p className="">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
};

const OverViewBox: NextPage<OverviewProps> = ({ assetToBase, selected, maxVal }) => {
  const router = useRouter()
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [toWithdrawSubmit, setToWithdrawSubmit] = useState<string | undefined>(undefined);
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(false);
  const [simResponse, setSimResponse] = useState<rpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<Positions>();

  const { connected, txType, poolSubmit, walletAddress } = useWallet();

  const poolId = process.env.NEXT_PUBLIC_POOL || '';
  const assetId =
    selected === 'XLM'
      ? process.env.NEXT_PUBLIC_COLLATERAL_ASSET || ''
      : process.env.NEXT_PUBLIC_STABLECOIN_ASSET || '';

  const { data: poolMeta } = usePoolMeta(poolId);
  const { data: pool } = usePool(poolMeta);
  const { data: poolUser } = usePoolUser(pool);
  const { data: poolEmissions } = usePoolEmissions(pool);
  const { data: poolOracle } = usePoolOracle(pool);
  const { data: tokenMetadata } = useTokenMetadata(assetId);
  const reserve = pool?.reserves.get(assetId);
  const decimals = reserve?.config.decimals ?? 7;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    // if (reserve && poolUser) {
    //   let curSupplied = poolUser.getCollateralFloat(reserve);
    //   let realWithdraw = amount;
    //   let num_withdraw = Number(amount);
    //   if (num_withdraw > curSupplied) {
    //     realWithdraw = curSupplied.toFixed(decimals);
    //     num_withdraw = Number(realWithdraw);
    //   }
    //   setAmount(realWithdraw);
    setToWithdrawSubmit(amount);
    setLoadingEstimate(true);
    // }
  };

  const handleSubmitTransaction = async (sim: boolean) => {
    if (amount && connected && poolMeta && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(amount, decimals),
            request_type: RequestType.WithdrawCollateral,
            address: reserve.assetId,
          },
        ],
      };
      const result = await poolSubmit(poolMeta, submitArgs, sim);
      if (!sim) {
        setAmount(undefined);
        router.push('/dashboard')
      }
      return result;
    }
  };
  useDebouncedState(amount, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    setParsedSimResult(undefined);
    let response = await handleSubmitTransaction(true);
    if (response) {
      setSimResponse(response);
      if (rpc.Api.isSimulationSuccess(response)) {
        setParsedSimResult(parseResult(response, PoolContractV1.parsers.submit));
      }
    }
    setLoadingEstimate(false);
  });

  const reserveEmissions = poolEmissions?.find((e) => e.assetId === reserve?.assetId);
  const emissionsPerAsset =
    reserveEmissions?.supplyEmissions !== undefined && reserve
      ? reserveEmissions.supplyEmissions.emissionsPerYearPerToken(
          reserve.totalSupply(),
          reserve.config.decimals,
        )
      : 0;
  const oraclePrice = reserve ? poolOracle?.getPriceFloat(reserve.assetId) : 0;

  const newPoolUser = parsedSimResult && new PoolUser(walletAddress, parsedSimResult, new Map());
  // console.log('newPoolUser-----', newPoolUser)
  const newPositionsEstimate =
    pool && parsedSimResult && poolOracle
      ? PositionsEstimate.build(pool, poolOracle, parsedSimResult)
      : undefined;
  const nextBorrowCap = newPositionsEstimate?.borrowCap;
  const nextBorrowLimit =
    newPositionsEstimate && Number.isFinite(newPositionsEstimate?.borrowLimit)
      ? newPositionsEstimate?.borrowLimit
      : 0;

  const gasFee = `${toBalance(BigInt((simResponse as any)?.minResourceFee ?? 0), decimals)} XLM`;
  const totalSupply = `${toBalance(newPoolUser?.getCollateralFloat(reserve))} ${selected}`;
  const borrowCapacity = `$${toBalance(nextBorrowCap)}`;
  const borrowLimit = toPercentage(nextBorrowLimit);

  return (
    <>
      <Grid
        container
        sx={{
          borderBottom: '1px solid #E0E0E0',
          paddingLeft: '8px',
          paddingBlock: '16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid item xs={6}>
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
            <InputLabel
              htmlFor="outlined-adornment-amount"
              sx={{
                color: 'white',
                '&.Mui-focused': {
                  color: 'white',
                },
              }}
            >
              Amount to withdraw
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              type="number"
              value={amount === '0' ? '' : amount}
              onChange={handleAmountChange}
              inputProps={{
                min: 0,
                step: 'any',
                style: {
                  MozAppearance: 'textfield',
                  fontSize: '16px',
                },
              }}
              sx={{
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                color: 'white',
              }}
              endAdornment={<InputAdornment position="end">{selected}</InputAdornment>}
              label="Amount to withdraw"
            />
          </FormControl>
        </Grid>
        <Grid
          item
          xs={6}
          sx={{
            paddingInline: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '22px',
          }}
        >
          <p>${(Number(amount) * assetToBase).toFixed(2)}</p>
          <Button
            variant="contained"
            sx={{ paddingBlock: '10px' }}
            onClick={() => handleSubmitTransaction(false)}
          >
            Withdraw
          </Button>
        </Grid>
      </Grid>
      <div className="flex items-center justify-center  bg-gradient-to-t to-[rgba(0,0,0,0.1024)] from-[rgba(226,226,226,0.06)] py-4 px-6 font-light">
        <div className="w-3/5 flex flex-col gap-1 text-sm">
          <div className="font-bold text-center text-lg pb-1">Transaction Overview</div>
          <Item label="Amount to withdraw:" value={amount ? amount + ' ' + selected : 0} />
          <div className="flex justify-between">
            <div>
              <LocalGasStationIcon /> Gas:
            </div>
            <p className="font-semibold">{gasFee}</p>
          </div>
          <Item label="Your total supplied:" value={totalSupply} />
          <Item label="Borrow capacity:" value={borrowCapacity} />
          <Item label="Borrow limit:" value={borrowLimit} />
        </div>
      </div>
    </>
  );
};

export default OverViewBox;
