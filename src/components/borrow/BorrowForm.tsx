import React from 'react';
import { Box } from '@mui/material';
import TokenSelection from '../common/TokenSelection';
import { TokenType } from '../../interfaces';

interface BorrowFormProps {
  tokens: TokenType[];
  collateralToken: TokenType;
  debtToken: TokenType;
  collateralAmount: string;
  debtAmount: string; // This should reflect the actual converted amount
  onCollateralTokenSelect: (token: TokenType) => void;
  onDebtTokenSelect: (token: TokenType) => void;
  onCollateralAmountChange: (value: string) => void;
  onDebtAmountChange: (value: string) => void;
  getTokenBalance: (token: TokenType) => string;
}

const BorrowForm: React.FC<BorrowFormProps> = ({
  tokens,
  collateralToken,
  debtToken,
  collateralAmount,
  debtAmount, // This will now be the properly converted amount
  onCollateralTokenSelect,
  onDebtTokenSelect,
  onCollateralAmountChange,
  onDebtAmountChange,
  getTokenBalance,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ width: '45%' }}>
        <TokenSelection
          tokens={tokens}
          selectedToken={collateralToken}
          onTokenSelect={onCollateralTokenSelect}
          balance={getTokenBalance(collateralToken)}
          amount={collateralAmount}
          onAmountChange={onCollateralAmountChange}
          alignment="start"
          decimals={3}
        />
      </Box>
      <Box sx={{ color: 'white', fontSize: 24 }}>↔</Box>
      <Box sx={{ width: '45%' }}>
        <TokenSelection
          tokens={tokens}
          selectedToken={debtToken}
          onTokenSelect={onDebtTokenSelect}
          balance={getTokenBalance(debtToken)}
          amount={debtAmount} // This will now show the correct converted amount
          onAmountChange={onDebtAmountChange}
          alignment="end"
          decimals={3}
        />
      </Box>
    </Box>
  );
};

export default BorrowForm;
