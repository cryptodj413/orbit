import React, { useEffect, useRef } from 'react';
import { InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    border: 'none',
    borderRadius: 4,
    padding: '2px',
    color: 'white',
    fontSize: '2.125rem',
    fontFamily: theme.typography.h4.fontFamily,
    fontWeight: theme.typography.h4.fontWeight,
    lineHeight: theme.typography.h4.lineHeight,
    textAlign: 'center',
    '&:focus': {
      outline: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
}));

interface DynamicWidthInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const DynamicWidthInput: React.FC<DynamicWidthInputProps> = ({ value, onChange, placeholder }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const minWidth = 30;
      const charWidth = 20;
      const padding = 10;
      const valueWidth = Math.max(value.length * charWidth, placeholder.length * charWidth);
      const newWidth = Math.max(minWidth, valueWidth) + padding;
      inputRef.current.style.width = `${newWidth}px`;
    }
  }, [value, placeholder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty string
    if (newValue === '') {
      onChange(e);
      return;
    }

    // Check if the new value is a valid number with up to one decimal point
    const isValidNumber = /^\d*\.?\d*$/.test(newValue);
    const hasOneOrNoPeriods = (newValue.match(/\./g) || []).length <= 1;

    if (isValidNumber && hasOneOrNoPeriods) {
      // Remove leading zeros unless it's "0." or just "0"
      if (newValue.length > 1 && newValue[0] === '0' && newValue[1] !== '.') {
        e.target.value = newValue.replace(/^0+/, '');
      }
      // Prevent multiple leading zeros after decimal
      if (newValue.includes('.')) {
        const [whole, decimal] = newValue.split('.');
        e.target.value = `${whole.replace(/^0+/, '') || '0'}.${decimal}`;
      }
      onChange(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, arrow keys, tab
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }

    // Prevent entering another decimal point if one already exists
    if (e.key === '.' && value.includes('.')) {
      e.preventDefault();
      return;
    }

    // Only allow numbers and decimal point
    if (!/[\d.]/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <StyledInput
      inputRef={inputRef}
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      type="text"
      inputProps={{
        inputMode: 'decimal',
        pattern: '[0-9]*[.]?[0-9]*',
      }}
      placeholder={placeholder}
    />
  );
};

export default DynamicWidthInput;
