import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface CollateralRatioSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
}

const CollateralRatioSlider: React.FC<CollateralRatioSliderProps> = ({ value, onChange }) => (
  <Box>
    <Typography variant="subtitle1" color="white">
      Collateral Ratio
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Slider
        value={value}
        onChange={onChange}
        aria-labelledby="collateral-ratio-slider"
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: 110, label: '110%' },
          { value: 200, label: '200%' },
          { value: 300, label: '300%' },
          { value: 500, label: '500%' },
        ]}
        min={110}
        max={500}
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
