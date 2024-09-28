// components/borrow/BorrowCard.tsx
import React from 'react';
import { Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#030615',
  borderRadius: '25px',
  overflow: 'hidden',
  display: 'flex',
  width: '680px',
  padding: theme.spacing(4),
  paddingBottom: 0,
}));

const BorrowCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StyledCard>
    <CardContent sx={{ p: 0 }}>{children}</CardContent>
  </StyledCard>
);

export default BorrowCard;
