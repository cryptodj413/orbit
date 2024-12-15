import {
  Account,
  BASE_FEE,
  Contract,
  SorobanRpc,
  TimeoutInfinite,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { useSorobanReact } from '@soroban-react/core';
import { WalletChain } from '@soroban-react/types';
import { signTransaction } from '@stellar/freighter-api';

import { fetchContractValue, getTxBuilder } from '../utils/fetchContractValue';
import { useState } from 'react';
import BigNumber from 'bignumber.js';
import { PoolContract } from '@blend-capital/blend-sdk';

enum SendTxStatus {
  PENDING = 'PENDING',
  DUPLICATE = 'DUPLICATE',
  TRY_AGAIN_LATER = 'TRY_AGAIN_LATER',
  ERROR = 'ERROR',
}
const sorobanRPC: Record<ChainName, string> = {
  Testnet: 'https://soroban-testnet.stellar.org',
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
  SUPPLY_COLLATERAL = 'SupplyCollateral',
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
  TESTNET = 'Testnet',
}

const getTxBuildResult = (
  account: Account,
  contractAddress: string,
  funcName: string,
  args: xdr.ScVal[],
  fee: string,
  activeChain: WalletChain,
) => {
  const contract = new Contract(contractAddress);
  const pool = new PoolContract(contractAddress);
  const source = new Account(
    account.accountId(),
    // https://github.com/stellar/js-stellar-base/blob/master/docs/reference/building-transactions.md#sequence-numbers
    BigNumber(account.sequenceNumber()).minus(BigNumber(1)).toFixed(),
  );

  const txBuilder = getTxBuilder(source, fee, activeChain.networkPassphrase);

  const txBuild = txBuilder
    .addOperation(contract.call(funcName, ...args))
    .setTimeout(TimeoutInfinite)
    .build();

  return txBuild;
};

// Build and submits a transaction to the Soroban RPC
// Polls for non-pending state, returns result after status is updated
export const submitTx = async (
  signedXDR: string,
  networkPassphrase: string,
  server: SorobanRpc.Server,
) => {
  const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase);

  const sendResponse = await server.sendTransaction(tx);

  if (sendResponse.errorResult)
    throw new Error(`Unable to submit transaction - ${JSON.stringify(sendResponse.errorResult)}`);

  if (sendResponse.status === SendTxStatus.PENDING) {
    let txResponse = await server.getTransaction(sendResponse.hash);

    // Poll this until the status is not "NOT_FOUND"
    while (txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      // See if the transaction is complete
      // eslint-disable-next-line no-await-in-loop
      txResponse = await server.getTransaction(sendResponse.hash);
      // Wait a second
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return txResponse.resultXdr.toXDR('base64');
    }

    throw new Error(`Unabled to submit transaction, status: ${sendResponse.status}`);
  }
  return null;
};

export const useWriteContract = () => {
  const { activeChain, address } = useSorobanReact();
  const [isError, setIsError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  const write = async (contractAddress: string, method: ContractMethods, args: xdr.ScVal[]) => {
    setLoading(true);
    setIsError(false);
    setSuccess(false);
    setError(null);
    try {
      if (!activeChain || !address) return;

      const server = new SorobanRpc.Server(sorobanRPC[activeChain.name as ChainName], {
        allowHttp: true,
      });
      const account = await server.getAccount(address);

      const source = new Account(address, account.sequenceNumber());

      const simulateResult = await fetchContractValue({
        server,
        networkPassphrase: activeChain.networkPassphrase,
        contractAddress,
        method,
        args,
        source,
        fee: BASE_FEE,
      });

      const buildResult = getTxBuildResult(
        source,
        contractAddress,
        method,
        args,
        simulateResult.minResourceFee,
        activeChain,
      );

      const prepareTx = await server.prepareTransaction(buildResult);

      const signedXDR = await signTransaction(prepareTx.toXDR(), {
        network: activeChain.name,
        networkPassphrase: activeChain.networkPassphrase,
        accountToSign: address,
      });

      await submitTx(signedXDR, activeChain.networkPassphrase, server);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error(error);

      const err = error as Error;
      setError(JSON.stringify(err.message));

      setIsError(true);
      setLoading(false);
    }
  };

  return {
    isError,
    isLoading,
    isSuccess,
    error,
    setSuccess,
    setIsError,
    write,
  };
};
