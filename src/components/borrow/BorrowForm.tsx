// components/borrow/BorrowForm.tsx
import React from 'react';
import { Box, Typography, Select, MenuItem } from '@mui/material';
import DynamicWidthInput from '../common/DynamicWidthInput';

interface BorrowFormProps {
  xlmAmount: string;
  oUsdAmount: string;
  onXlmChange: (value: string) => void;
  onOUsdChange: (value: string) => void;
}

const BorrowForm: React.FC<BorrowFormProps> = ({
  xlmAmount,
  oUsdAmount,
  onXlmChange,
  onOUsdChange,
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <CurrencyInput
      value={xlmAmount}
      onChange={onXlmChange}
      currency="XLM"
      label="Stellar Lumen (XLM)"
    />
    <Box sx={{ color: 'white', fontSize: 24 }}>↔</Box>
    <CurrencyInput
      value={oUsdAmount}
      onChange={onOUsdChange}
      currency="oUSD"
      label="Orbital Dollar (oUSD)"
    />
  </Box>
);

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  label: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, currency, label }) => (
  <Box
    sx={{
      width: '45%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
      <DynamicWidthInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
      <Typography variant="h4" color="white" sx={{ ml: 1 }}>
        {currency}
      </Typography>
    </Box>
    <Select
      value={currency}
      sx={{
        mt: 1,
        color: 'white',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.23)',
        },
      }}
    >
      <MenuItem value={currency}>{label}</MenuItem>
    </Select>
  </Box>
);

export default BorrowForm;
