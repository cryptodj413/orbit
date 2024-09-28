// components/common/StyledGrid.tsx
import React from 'react';
import { Grid, GridProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& > .MuiGrid-item': {
    borderRight: '1px solid rgba(255, 255, 255, 0.32)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.32)',
    padding: theme.spacing(2),
    '&:last-child': {
      borderRight: 'none',
    },
  },
  '& > .MuiGrid-item:nth-of-type(3)': {
    borderRight: 'none',
  },
  '& > .MuiGrid-item:nth-last-of-type(-n+3):not(:nth-of-type(1), :nth-of-type(2), :nth-of-type(3))':
    {
      borderBottom: 'none',
    },
  borderRadius: '17px',
  border: '1px solid rgba(255, 255, 255, 0.32)',
}));

const CustomStyledGrid: React.FC<GridProps> = (props) => {
  return <StyledGrid container {...props} />;
};

export default CustomStyledGrid;
