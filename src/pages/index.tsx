import { Box } from '@mui/material';
import { NextPage } from 'next';
import SwapAnvil from '../components/swap/SwapAnvil';
import BorrowAnvil from '../components/borrow/BorrowAnvil';
import Dashboard from '../components/dashboard/PositionOverview';

const Index: NextPage = () => {
  return <Dashboard />;
};

export default Index;
