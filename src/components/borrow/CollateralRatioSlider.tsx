// components/borrow/CollateralRatioSlider.tsx
import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface CollateralRatioSliderProps {
  value: number;
  onChange: (newValue: number) => void;
}

const CollateralRatioSlider: React.FC<CollateralRatioSliderProps> = ({ value, onChange }) => (
  <Box>
    <Typography variant="subtitle1" color="white">
      Collateral Ratio
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        aria-labelledby="collateral-ratio-slider"
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: 135, label: '135%' },
          { value: 200, label: '200%' },
          { value: 250, label: '250%' },
          { value: 300, label: '300%' },
        ]}
        min={135}
        max={300}
        sx={{
          color: '#96FD02',
          '& .MuiSlider-thumb': {
            backgroundColor: '#96FD02',
            width: 16,
            height: 16,
          },
          '& .MuiSlider-track': {
            backgroundColor: '#96FD02',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#797979',
          },
          '& .MuiSlider-mark': {
            backgroundColor: '#96FD02',
            opacity: 0.4,
          },
          '& .MuiSlider-markActive': {
            backgroundColor: '#96FD02',
            opacity: 0.4,
          },
          width: '95%',
        }}
      />
    </Box>
  </Box>
);

export default CollateralRatioSlider;
