import { useState } from 'react';
import { NextPage } from 'next';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Grid,
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

interface OverviewProps {
  assetToBase: number;
  selected: string;
  maxVal: number
  gas: string,
  total: string,
  capacity: string,
  limit: string
}

const Item = ({ label, value }) => {
  return (
    <div className="flex justify-between">
      <p className="">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
};

const OverViewBox: NextPage<OverviewProps> = ({assetToBase, selected, maxVal,gas, total, capacity, limit}) => {
  const [amount, setAmount] = useState(0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

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
              value={amount === 0 ? '' : amount}
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
          <p>${(amount * assetToBase).toFixed(2)}</p>
          <Button variant="contained" sx={{ paddingBlock: '10px' }}>
            Withdraw
          </Button>
        </Grid>
      </Grid>
      <div className="flex items-center justify-center  bg-gradient-to-t to-[rgba(0,0,0,0.1024)] from-[rgba(226,226,226,0.06)] py-4 px-6 font-light">
        <div className="w-3/5 flex flex-col gap-1 text-sm">
          <div className="font-bold text-center text-lg pb-1">Transaction Overview</div>
          <Item label="Amount to repay:" value={amount+selected} />
          <div className="flex justify-between">
            <div>
              <LocalGasStationIcon /> Gas:
            </div>
            <p className="font-semibold">{gas}</p>
          </div>
          <Item label="Your total borrowed:" value={total} />
          <Item label="Borrow capacity:" value={capacity} />
          <Item label="Borrow limit:" value={limit} />
        </div>
      </div>
    </>
  );
};

export default OverViewBox;
