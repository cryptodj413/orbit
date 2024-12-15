import { useCallback, useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import { contractInvoke } from '@soroban-react/contracts';
import { SorobanRpc } from '@stellar/stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

interface UseContractProps {
  contractId: string;
  method: string;
  args?: StellarSdk.xdr.ScVal[];
}

interface ContractReturnType<T = any> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useContract<T = any>({
  contractId,
  method,
  args = [],
}: UseContractProps): ContractReturnType<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sorobanContext = useSorobanReact();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await contractInvoke({
        contractAddress: contractId,
        method: method,
        args: args,
        sorobanContext,
      });

      const parsedResult = parseStellarValue(result) as T;
      setData(parsedResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contract data'));
    } finally {
      setIsLoading(false);
    }
  }, [contractId, method, JSON.stringify(args), sorobanContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

function parseStellarValue(value: any): any {
  if (!value) return null;

  if (value instanceof StellarSdk.xdr.ScVal) {
    if (value.switch().name === 'scvI128') {
      const i128 = value.i128();
      return BigInt(i128.lo().toString());
    }
  }

  return value;
}
