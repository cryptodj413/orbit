import { TxResponse, contractInvoke } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import { useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useSWRConfig } from 'swr';
import { useRouterAddress } from './useRouterAddress';

export enum RouterMethod {
  ADD_LIQUIDITY = 'add_liquidity',
  REMOVE_LIQUIDITY = 'remove_liquidity',
  SWAP_EXACT_IN = 'swap_exact_tokens_for_tokens',
  SWAP_EXACT_OUT = 'swap_tokens_for_exact_tokens',
  QUOTE = 'router_quote',
  GET_AMOUNT_OUT = 'router_get_amount_out',
  GET_AMOUNT_IN = 'router_get_amount_in',
  GET_AMOUNTS_OUT = 'router_get_amounts_out',
  GET_AMOUNTS_IN = 'router_get_amounts_in',
}

interface TransactionError extends Error {
  txResponse?: TxResponse;
  method?: RouterMethod;
  args?: StellarSdk.xdr.ScVal[];
}

const isObject = (val: any) => typeof val === 'object' && val !== null && !Array.isArray(val);

const revalidateKeysCondition = (key: any) => {
  const revalidateKeys = new Set([
    'balance',
    'lp-tokens',
    'reserves',
    'trade',
    'subscribed-pairs',
    'currencyBalance',
    'horizon-account',
    'swap-network-fees',
  ]);
  return Array.isArray(key) && key.some((k) => revalidateKeys.has(k));
};

const logTransactionResult = (
  method: RouterMethod,
  result: TxResponse,
  args?: StellarSdk.xdr.ScVal[],
) => {
  try {
    // Log structured transaction data
    const txInfo = {
      method,
      timestamp: new Date().toISOString(),
      status: result?.status,
      hash: result,
      args: args?.map((arg) => arg.toXDR('base64')), // Convert args to readable format
      rawResult: result,
    };

    if (result?.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      console.warn('Transaction not successful:', result);
    }

    console.groupEnd();

    return txInfo;
  } catch (error) {
    console.error('Error logging transaction result:', error);
    return null;
  }
};

export function useRouterCallback() {
  const sorobanContext = useSorobanReact();
  const { router } = useRouterAddress();
  console.log(sorobanContext);
  const router_address = router!;
  const { mutate } = useSWRConfig();

  return useCallback(
    async (method: RouterMethod, args?: StellarSdk.xdr.ScVal[], signAndSend?: boolean) => {
      try {
        const result = (await contractInvoke({
          contractAddress: router_address as string,
          method: method,
          args: args,
          sorobanContext,
          signAndSend: signAndSend,
          reconnectAfterTx: false,
        })) as TxResponse;

        // Log the result with structured data
        const txInfo = logTransactionResult(method, result, args);

        // If it's only a simulation, return the result
        if (!signAndSend) return result;

        // Check for unsuccessful transaction
        if (
          isObject(result) &&
          result?.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS
        ) {
          const error: TransactionError = new Error(`Transaction failed: ${result}`);
          error.txResponse = result;
          error.method = method;
          error.args = args;
          throw error;
        }

        // Revalidate cache if transaction was successful
        await mutate((key: any) => revalidateKeysCondition(key), undefined, { revalidate: true });

        return result;
      } catch (error) {
        // Enhanced error handling
        console.error('Router transaction error:', {
          method,
          error,
          args: args,
        });
        throw error;
      }
    },
    [router_address, sorobanContext, mutate],
  );
}
