import { TxResponse, contractInvoke } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import { useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useSWRConfig } from 'swr';

// Constants
const POOL_ID = 'CCEVW3EEW4GRUZTZRTAMJAXD6XIF5IG7YQJMEEMKMVVGFPESTRXY2ZAV';

// Types
export type BorrowCallbackArgs = {
  amount: string;
  assetAddress: string;
  decimals?: number;
};

interface TransactionError extends Error {
  txResponse?: TxResponse;
  method?: string;
  args?: StellarSdk.xdr.ScVal[];
}

// Method names for the contract
enum PoolMethods {
  SUPPLY_COLLATERAL = 'supply_collateral',
  BORROW = 'borrow',
}

const revalidateKeysCondition = (key: any) => {
  const revalidateKeys = new Set(['balance', 'pool', 'positions', 'user-data', 'horizon-account']);
  return Array.isArray(key) && key.some((k) => revalidateKeys.has(k));
};

/**
 * A hook that returns a callback for executing borrow operations
 */
export function useBorrowCallback() {
  const sorobanContext = useSorobanReact();
  const { mutate } = useSWRConfig();

  return useCallback(
    async ({ amount, assetAddress, decimals = 7 }: BorrowCallbackArgs, simulation = false) => {
      try {
        // Convert amount to the correct decimal scale for the contract
        const scaledAmount = BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));

        // Create ScVal arguments for the contract calls
        const amountScVal = StellarSdk.xdr.ScVal.scvI128(
          new StellarSdk.xdr.Int128Parts({
            lo: StellarSdk.xdr.Uint64.fromString(scaledAmount.toString()),
            hi: StellarSdk.xdr.Int64.fromString('0'),
          }),
        );

        const addressScVal = new StellarSdk.Address(assetAddress).toScVal();
        console.log({
          contractAddress: POOL_ID,
          method: PoolMethods.SUPPLY_COLLATERAL,
          args: [amountScVal, addressScVal],
          sorobanContext,
          signAndSend: !simulation,
        });
        // First, supply collateral
        const supplyCollateralResult = (await contractInvoke({
          contractAddress: POOL_ID,
          method: 'deposit',
          args: [amountScVal, addressScVal],
          sorobanContext,
          signAndSend: !simulation,
        })) as TxResponse;
        console.log('check');

        // Check for unsuccessful supply transaction
        if (
          !simulation &&
          supplyCollateralResult?.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS
        ) {
          const error: TransactionError = new Error(
            `Supply collateral transaction failed: ${supplyCollateralResult}`,
          );
          error.txResponse = supplyCollateralResult;
          error.method = PoolMethods.SUPPLY_COLLATERAL;
          throw error;
        }

        // If this is just a simulation, return the supply result
        if (simulation) {
          return supplyCollateralResult;
        }

        // Then, execute the borrow
        const borrowResult = (await contractInvoke({
          contractAddress: POOL_ID,
          method: PoolMethods.BORROW,
          args: [amountScVal, addressScVal],
          sorobanContext,
          signAndSend: !simulation,
        })) as TxResponse;

        // Check for unsuccessful borrow transaction
        if (
          !simulation &&
          borrowResult?.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS
        ) {
          const error: TransactionError = new Error(`Borrow transaction failed: ${borrowResult}`);
          error.txResponse = borrowResult;
          error.method = PoolMethods.BORROW;
          throw error;
        }

        // If both transactions are successful, revalidate relevant cache entries
        if (!simulation) {
          await mutate((key: any) => revalidateKeysCondition(key), undefined, { revalidate: true });
        }

        return borrowResult;
      } catch (error) {
        console.error('Borrow transaction error:', error);
        throw error;
      }
    },
    [sorobanContext, mutate],
  );
}
