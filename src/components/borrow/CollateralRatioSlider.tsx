import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface CollateralRatioSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
}

const CollateralRatioSlider: React.FC<CollateralRatioSliderProps> = ({ value, onChange }) => (
  <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.32)', paddingBlock: '22px', paddingInline: '50px'}}>
    <Typography variant="subtitle1" color="white" marginBottom='8px'>
      Collateral Ratio
    </Typography>

    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Slider
        value={value}
        onChange={onChange}
        aria-labelledby="collateral-ratio-slider"
        valueLabelDisplay="auto"
        size='small'
        step={1}
        marks={[
          { 
            value: 135, 
            label: <span style={{ textShadow: value === 135 ? '0 4px 4px #D1CA45' : 'none' }}>135%</span>
          },
          { 
            value: 200, 
            label: <span style={{ textShadow: value === 200 ? '0 4px 4px #D1CA45' : 'none' }}>200%</span>
          },
          { 
            value: 250, 
            label: <span style={{ textShadow: value === 250 ? '0 4px 4px #D1CA45' : 'none' }}>250%</span>
          },
          { 
            value: 300, 
            label: <span style={{ textShadow: value === 300 ? '0 4px 4px #D1CA45' : 'none' }}>300%</span>
          },
        ]}
        min={135}
        max={300}
        sx={{
          color: '#96FD02',
          '& .MuiSlider-thumb': {
            backgroundColor: '#96FD02',
            width: 10,
            height: 10,
          },
          '& .MuiSlider-track': {
            backgroundColor: '#96FD02',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#797979',
          },
          '& .MuiSlider-mark': {
            backgroundColor: '#797979',
            opacity: 0.4,
            width: 6, 
            height: 6,
            borderRadius: '50%',
          },
          '& .MuiSlider-markActive': {
            backgroundColor: '#96FD02',
            opacity: 0.4,
            width: 5,
            height: 5,
            borderRadius: '50%',
          },
          width: '95%',
        }}
      />
    </Box>
  </Box>
);

export default CollateralRatioSlider;
