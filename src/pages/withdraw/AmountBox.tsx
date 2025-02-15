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
import { styled } from '@mui/material/styles';

interface AmountBoxProps {
  price: number;
  selected: string;
}

const AmountBox: NextPage<AmountBoxProps> = ({price, selected}) => {
  const [amount, setAmount] = useState(0);

  const CustomTextField = styled(TextField)({
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
      {
        '-webkit-appearance': 'none',
        margin: 0,
      },
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  return (
    <Grid
      container
      sx={{
        borderTop: '1px solid #E0E0E0',
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
            value={amount}
            onChange={handleAmountChange}
            inputProps={{
              min: 0,
              step: 'any',
              style: {
                MozAppearance: 'textfield',
                fontSize: '16px'
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
        <p>${(amount * price).toFixed(2)}</p>
        <Button variant="contained" sx={{ paddingBlock: '10px' }}>
          Withdraw
        </Button>
      </Grid>
    </Grid>
  );
};

export default AmountBox;
