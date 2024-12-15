import { useSorobanReact } from '@soroban-react/core';
import { useMemo } from 'react';

import { Account, BASE_FEE, SorobanRpc, scValToNative, xdr } from '@stellar/stellar-sdk';

import { useQuery } from '@tanstack/react-query';
import { fetchContractValue } from '../utils/fetchContractValue';
import BigNumber from 'bignumber.js';

const sorobanRPC: Record<ChainName, string> = {
  Futurenet: 'https://rpc-futurenet.stellar.org:443',
};

export enum ContractMethods {
  BALANCE = 'balance',
  GET_PRICE = 'GetPrice',
  GET_DEPOSIT = 'GetDeposit',
  GET_USER_DEPOSITED_USD = 'GetUserDepositedUsd',
  GET_USER_BORROWED_USD = 'GetUserBorrowedUsd',
  GET_AVAILABLE_TO_BORROW = 'GetAvailableToBorrow',
  GET_USER_COLLATERAL_USD = 'GetUserCollateralUsd',
  GET_AVAILABLE_TO_REDEEM = 'GetAvailableToRedeem',
  DEPOSIT = 'Deposit',
  REDEEM = 'Redeem',
  BORROW = 'Borrow',
  GET_USER_BORROW_AMOUNT_WITH_INTEREST = 'GetUserBorrowAmountWithInterest',
  GET_LIQUIDITY_RATE = 'GetLiquidityRate',
  GET_INTEREST_RATE = 'GetInterestRate',
  GET_TOTAL_RESERVES_BY_TOKEN = 'GetTotalReservesByToken',
  GET_TVL = 'GetTVL',
  USER_DEPOSIT_AS_COLLATERAL = 'UserDepositAsCollateral',
  TOGGLE_COLLATERAL_SETTING = 'ToggleCollateralSetting',
  GET_AVAILABLE_LIQUIDITY_BY_TOKEN = 'GetAvailableLiquidityByToken',
  GET_UTILIZATION_RATE_BY_TOKEN = 'GetUtilizationRateByToken',
  REPAY = 'Repay',
  REQUEST_TOKEN = 'request_token',
  GET_TOTAL_BORROWED_BY_TOKEN = 'GetTotalBorrowedByToken',
}

export enum ChainName {
  FUTURENET = 'Futurenet',
}

export const useMultiCall = <T>(
  contractAddress: string,
  methods: { key: string; method: ContractMethods }[],
  initialData: T,
  args?: xdr.ScVal[],
  // set enabled to true only when request need account address
  enabled?: boolean,
  queryKey?: string,
) => {
  const { address, activeChain } = useSorobanReact();
  const server = useMemo(() => {
    const chainName = activeChain?.name ?? ChainName.FUTURENET;
    return new SorobanRpc.Server(sorobanRPC[chainName as ChainName], {
      allowHttp: true,
    });
  }, [activeChain]);

  const query = useQuery<T>({
    queryKey: [queryKey ?? methods.map((i) => i.key).join('-')],
    enabled: enabled ?? true,
    initialData,

    queryFn: async () => {
      const res = await Promise.all(
        methods.map(async ({ key, method }) => {
          try {
            let source;
            if (address && enabled !== false) {
              const account = await server.getAccount(address);

              source = new Account(address, account.sequenceNumber());
            } else {
              source = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
            }

            const res = await fetchContractValue({
              server,
              networkPassphrase:
                activeChain?.networkPassphrase ?? 'Test SDF Future Network ; October 2022',
              contractAddress,
              method,
              args,
              source,
              fee: BASE_FEE,
            });

            const nativeRes = scValToNative(res.result!.retval) as unknown;

            if (typeof nativeRes === 'bigint') {
              return { [key]: BigNumber(nativeRes.toString()) } as T;
            }

            return { [key]: nativeRes } as T;
          } catch (error) {
            console.error(method, error);
            return { [key]: BigNumber(0) } as T;
          }
        }),
      ).then((data) => {
        let obj = {} as T;
        data.forEach((d) => {
          obj = { ...obj, ...d };
        });
        return obj;
      });

      return res;
    },
  });

  return {
    ...query,
    data: query.data ?? initialData,
  };
};
