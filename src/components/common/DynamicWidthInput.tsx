// components/common/DynamicWidthInput.tsx
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
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '&[type=number]': {
      '-moz-appearance': 'textfield',
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
      const minWidth = 30; // Minimum width for the input
      const valueWidth = value.length * 20; // Approximate width per character
      const newWidth = Math.max(minWidth, valueWidth);
      inputRef.current.style.width = `${newWidth}px`;
    }
  }, [value]);

  return (
    <StyledInput
      inputRef={inputRef}
      value={value}
      onChange={onChange}
      type="number"
      placeholder={placeholder}
    />
  );
};

export default DynamicWidthInput;
