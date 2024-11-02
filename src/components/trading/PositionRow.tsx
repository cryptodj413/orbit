import React, { useState } from 'react';
import { TableRow, TableCell, Typography, Button, Box } from '@mui/material';
import Image from 'next/image';
import { Position } from 'position-manager-sdk';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { selectTokenData } from '../../store/perpsSlice';
import { closePosition } from '../../store/walletSlice';

interface PositionRowProps {
  position: Position;
  onClosePosition: () => void;
}

const SCALAR_7 = 10_000_000; // 10^7

const PositionRow: React.FC<PositionRowProps> = ({ position, onClosePosition }) => {
  const dispatch = useDispatch<AppDispatch>();
  const xlmTokenData = useSelector((state: RootState) => selectTokenData(state, 'XLM'));
  const usdTokenData = useSelector((state: RootState) => selectTokenData(state, 'USD'));
  const { contractId, isPositionOperationInProgress } = useSelector(
    (state: RootState) => state.wallet
  );

  const [showTakeProfitInput, setShowTakeProfitInput] = useState(false);
  const [showStopLossInput, setShowStopLossInput] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  if (!xlmTokenData || !usdTokenData) {
    return null; // Or a loading state
  }

  const xlmPrice = xlmTokenData.oraclePrice;
  const usdPrice = usdTokenData.oraclePrice;

  const formatValue = (value: number, inXLM: boolean = true) => {
    const valueInUSD = inXLM ? value * xlmPrice : value;
    return `${inXLM ? value.toFixed(2) : valueInUSD.toFixed(2)} ${inXLM ? 'XLM' : 'USD'}`;
  };

  const size = Number(position.borrowed) / SCALAR_7;
  const collateral = Number(position.collateral) / SCALAR_7;
  const entryPrice = Number(position.entry_price) / SCALAR_7;
  const markPrice = xlmPrice;

  const liquidationPrice = entryPrice * (1 - collateral / (collateral + size));

  const leverage = size / collateral;
  const pnl = size * (markPrice - entryPrice);
  const pnlPercentage = ((markPrice - entryPrice) / entryPrice) * 100;
  const value = size * markPrice;

  const handleClosePosition = async () => {
    if (contractId) {
      try {
        await dispatch(closePosition(contractId)).unwrap();
      } catch (error) {
        console.error('Failed to close position:', error);
      }
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src="/icons/tokens/xlm.svg"
            alt="XLM"
            width={24}
            height={24}
            style={{ borderRadius: '50%' }}
          />
          <Typography color="white">XLM</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography color="white">{formatValue(value, false)}</Typography>
        <Typography
          style={{
            color: pnl >= 0 ? 'rgb(50, 223, 123)' : 'rgb(235, 87, 87)',
          }}
          variant="body2"
        >
          {formatValue(pnl, false)} ({pnlPercentage.toFixed(2)}%)
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">
          {formatValue(size)} ({leverage.toFixed(2)}x)
        </Typography>
        <Typography color="white" variant="body2">
          {formatValue(size, false)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">{formatValue(collateral)}</Typography>
        <Typography color="white" variant="body2">
          {formatValue(collateral, false)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">
          {formatValue(entryPrice, false)} / {formatValue(markPrice, false)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">{formatValue(liquidationPrice, false)}</Typography>
      </TableCell>
      <TableCell>
        {showTakeProfitInput ? (
          <Box>
            <input
              type="number"
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(e.target.value)}
              placeholder="Price"
            />
            <Button>Set</Button>
          </Box>
        ) : (
          <Button variant="outlined" size="small" onClick={() => setShowTakeProfitInput(true)}>
            Add TP
          </Button>
        )}
      </TableCell>
      <TableCell>
        {showStopLossInput ? (
          <Box>
            <input
              type="number"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(e.target.value)}
              placeholder="Price"
            />
            <Button>Set</Button>
          </Box>
        ) : (
          <Button variant="outlined" size="small" onClick={() => setShowStopLossInput(true)}>
            Add SL
          </Button>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleClosePosition}
          disabled={isPositionOperationInProgress}
        >
          Close
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PositionRow;
