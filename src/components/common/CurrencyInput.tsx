import { InputAdornment, MenuItem, Select, styled, TextField } from '@mui/material';

const CurrencySelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currency,
  onCurrencyChange,
}) => (
  <TextField
    fullWidth
    variant="outlined"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <CurrencySelect
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as string)}
          >
            <MenuItem value="sUSD">sUSD</MenuItem>
            <MenuItem value="XLM">XLM</MenuItem>
          </CurrencySelect>
        </InputAdornment>
      ),
    }}
  />
);

export default CurrencyInput;
