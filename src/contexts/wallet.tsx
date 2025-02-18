import {
  ContractErrorType,
  Network,
  parseError,
  PoolClaimArgs,
  PoolContract,
  PoolContractV2,
  Positions,
  SubmitArgs,
  Version
} from '@blend-capital/blend-sdk';
import {
  AlbedoModule,
  FreighterModule,
  ISupportedWallet,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
} from '@creit.tech/stellar-wallets-kit';
import { getNetworkDetails as getFreighterNetwork } from '@stellar/freighter-api';
import {
  Asset,
  BASE_FEE,
  Operation,
  rpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import React, { useContext, useState } from 'react';
import { useSettings } from './settings';
import { useQueryClientCacheCleaner } from '../hooks/api';
import { PoolMeta } from '../hooks/types';
import { RouterContract, RouterGetAmountInArgs, RouterGetAmountOutArgs, RouterPairForArgs, RouterSwapExactTokensForTokensArgs, RouterSwapTokensForExactTokensArgs } from '../external/router';


export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  txStatus: TxStatus;
  setTxStatus: React.Dispatch<React.SetStateAction<TxStatus>>;
  lastTxHash: string | undefined;
  lastTxFailure: string | undefined;
  txType: TxType;
  walletId: string | undefined;
  isLoading: boolean;
  connect: (handleSuccess: (success: boolean) => void) => Promise<void>;
  disconnect: () => void;
  clearLastTx: () => void;
  restore: (sim: rpc.Api.SimulateTransactionRestoreResponse) => Promise<void>;
  poolSubmit: (
    poolId: PoolMeta,
    submitArgs: SubmitArgs,
    sim: boolean,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  swapExactTokensForTokens: (
    routerId: string,
    swapArgs: RouterSwapExactTokensForTokensArgs,
    sim: boolean,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  swapTokensforExactTokens: (
    routerId: string,
    swapArgs: RouterSwapTokensForExactTokensArgs,
    sim: boolean,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  routerGetAmountIn: (
    routerId: string,
    routerGetAmountInArgs: RouterGetAmountInArgs,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  routerGetAmountOut: (
    routerId: string,
    routerGetAmountOutArgs: RouterGetAmountOutArgs,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  routerPairFor: (
    routerId: string,
    routerPairForArgs: RouterPairForArgs,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  poolClaim: (
    poolId: PoolMeta,
    claimArgs: PoolClaimArgs,
    sim: boolean,
  ) => Promise<rpc.Api.SimulateTransactionResponse | undefined>;
  createTrustlines(assets: Asset[]): Promise<void>;
  getNetworkDetails(): Promise<Network & { horizonUrl: string }>;
}

export enum TxStatus {
  NONE,
  BUILDING,
  SIGNING,
  SUBMITTING,
  SUCCESS,
  FAIL,
}

export enum TxType {
  // Submit a contract invocation
  CONTRACT,
  // A transaction that is a pre-requisite for another transaction
  PREREQ,
}

const walletKit: StellarWalletsKit = new StellarWalletsKit({
  network: (process.env.NEXT_PUBLIC_PASSPHRASE ?? WalletNetwork.TESTNET) as WalletNetwork,
  selectedWalletId: XBULL_ID,
  modules: [new xBullModule(), new FreighterModule(), new LobstrModule(), new AlbedoModule()],
});

const WalletContext = React.createContext<IWalletContext | undefined>(undefined);

export const WalletProvider = ({ children = null as any }) => {
  const { network } = useSettings();

  const { cleanWalletCache, cleanBackstopCache, cleanPoolCache, cleanBackstopPoolCache } =
    useQueryClientCacheCleaner();

  const stellarRpc = new rpc.Server(network.rpc, network.opts);

  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txFailure, setTxFailure] = useState<string | undefined>(undefined);
  const [txType, setTxType] = useState<TxType>(TxType.CONTRACT);
  const [walletAddress, setWalletAddress] = useState<string>('');

  function setFailureMessage(message: string | undefined) {
    if (message) {
      // some contract failures include diagnostic information. If so, try and remove it.
      let substrings = message.split('Event log (newest first):');
      if (substrings.length > 1) {
        setTxFailure(`Contract Error: ${substrings[0].trimEnd()}`);
      } else {
        setTxFailure(`Stellar Error: ${message}`);
      }
    }
  }

  /**
  * Connect a wallet to the application via the walletKit
  */
  async function handleSetWalletAddress(): Promise<boolean> {
    try {
      const { address: publicKey } = await walletKit.getAddress();
      if (publicKey === '' || publicKey == undefined) {
        console.error('Unable to load wallet key: ', publicKey);
        return false;
      }
      setWalletAddress(publicKey);
      setConnected(true);
      return true;
    } catch (e: any) {
      console.error('Unable to load wallet information: ', e);
      return false;
    }
  }

  /**
   * Open up a modal to connect the user's browser wallet
   */
  async function connect(handleSuccess: (success: boolean) => void) {
    try {
      setLoading(true);
      await walletKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          walletKit.setWallet(option.id);
          let result = await handleSetWalletAddress();
          handleSuccess(result);
        },
      });
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      handleSuccess(false);
      console.error('Unable to connect wallet: ', e);
    }
  }

  function disconnect() {
    setWalletAddress('');
    setConnected(false);
    cleanWalletCache();
  }

  /**
   * Sign an XDR string with the connected user's wallet
   * @param xdr - The XDR to sign
   * @param networkPassphrase - The network passphrase
   * @returns - The signed XDR as a base64 string
   */
  async function sign(xdr: string): Promise<string> {
    if (connected) {
      setTxStatus(TxStatus.SIGNING);
      try {
        let { signedTxXdr } = await walletKit.signTransaction(xdr, {
          address: walletAddress,
          networkPassphrase: network.passphrase as WalletNetwork,
        });
        setTxStatus(TxStatus.SUBMITTING);
        return signedTxXdr;
      } catch (e: any) {
        if (e === 'User declined access') {
          setTxFailure('Transaction rejected by wallet.');
        } else if (typeof e === 'string') {
          setTxFailure(e);
        }
        setTxStatus(TxStatus.FAIL);
        throw e;
      }
    } else {
      throw new Error('Not connected to a wallet');
    }
  }

  async function restore(sim: rpc.Api.SimulateTransactionRestoreResponse): Promise<void> {
    let account = await stellarRpc.getAccount(walletAddress);
    setTxStatus(TxStatus.BUILDING);
    let fee = parseInt(sim.restorePreamble.minResourceFee) + parseInt(BASE_FEE);
    let restore_tx = new TransactionBuilder(account, { fee: fee.toString() })
      .setNetworkPassphrase(network.passphrase)
      .setTimeout(0)
      .setSorobanData(sim.restorePreamble.transactionData.build())
      .addOperation(Operation.restoreFootprint({}))
      .build();
    let signed_restore_tx = new Transaction(await sign(restore_tx.toXDR()), network.passphrase);
    setTxType(TxType.PREREQ);
    await sendTransaction(signed_restore_tx);
  }

  async function sendTransaction(transaction: Transaction): Promise<boolean> {
    let send_tx_response = await stellarRpc.sendTransaction(transaction);
    let curr_time = Date.now();

    // Attempt to send the transaction and poll for the result
    while (send_tx_response.status !== 'PENDING' && Date.now() - curr_time < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      send_tx_response = await stellarRpc.sendTransaction(transaction);
    }
    if (send_tx_response.status !== 'PENDING') {
      let error = parseError(send_tx_response);
      console.error('Failed to send transaction: ', send_tx_response.hash, error);
      setFailureMessage(ContractErrorType[error.type]);
      setTxStatus(TxStatus.FAIL);
      return false;
    }

    let get_tx_response = await stellarRpc.getTransaction(send_tx_response.hash);
    while (get_tx_response.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get_tx_response = await stellarRpc.getTransaction(send_tx_response.hash);
    }

    let hash = transaction.hash().toString('hex');
    setTxHash(hash);
    if (get_tx_response.status === 'SUCCESS') {
      // stall for a bit to ensure data propagates to horizon
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTxStatus(TxStatus.SUCCESS);
      return true;
    } else {
      let error = parseError(get_tx_response);
      console.error(`Transaction failed: `, hash, error);
      setFailureMessage(ContractErrorType[error.type]);
      setTxStatus(TxStatus.FAIL);
      return false;
    }
  }

  async function simulateOperation(
    operation: xdr.Operation
  ): Promise<rpc.Api.SimulateTransactionResponse> {
    try {
      setLoading(true);
      const account = await stellarRpc.getAccount(walletAddress);
      const tx_builder = new TransactionBuilder(account, {
        networkPassphrase: network.passphrase,
        fee: BASE_FEE,
        timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
      }).addOperation(operation);
      const transaction = tx_builder.build();
      const simulation = await stellarRpc.simulateTransaction(transaction);
      // if (simulation.error) {
      //   const error = parseError(simulation);
      //   console.error('Simulation failed:', error);
      //   setFailureMessage(ContractErrorType[error.type]);
      //   throw new Error(`Simulation failed: ${error.message || simulation.error}`);
      // }
      
      setLoading(false);
      return simulation;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  }

  async function invokeSorobanOperation<T>(operation: xdr.Operation, poolId?: string | undefined) {
    try {
      const account = await stellarRpc.getAccount(walletAddress);
      const tx_builder = new TransactionBuilder(account, {
        networkPassphrase: network.passphrase,
        fee: BASE_FEE,
        timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
      }).addOperation(operation);
      const transaction = tx_builder.build();
      const simResponse = await simulateOperation(operation);
      const assembled_tx = rpc.assembleTransaction(transaction, simResponse).build();
      const signedTx = await sign(assembled_tx.toXDR());
      const tx = new Transaction(signedTx, network.passphrase);
      await sendTransaction(tx);
    } catch (e: any) {
      console.error('Unknown error submitting transaction: ', e);
      setFailureMessage(e?.message);
      setTxStatus(TxStatus.FAIL);
    }
  }

  function clearLastTx() {
    setTxStatus(TxStatus.NONE);
    setTxHash(undefined);
    setTxFailure(undefined);
    setTxType(TxType.CONTRACT);
  }

  async function swapExactTokensForTokens(routerId: string, swapArgs: RouterSwapExactTokensForTokensArgs, sim: boolean): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      const router = new RouterContract(routerId);
      const xdrSwap = router.swapExactTokensForTokens(swapArgs);
      const operation = xdr.Operation.fromXDR(xdrSwap, 'base64');
      if (sim) {
        return await simulateOperation(operation);
      }
      await invokeSorobanOperation(operation);
      cleanWalletCache();
    }
  }

  async function swapTokensforExactTokens(routerId: string, swapArgs: RouterSwapTokensForExactTokensArgs, sim: boolean): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      const router = new RouterContract(routerId);
      const xdrSwap = router.swapTokensForExactTokens(swapArgs);
      const operation = xdr.Operation.fromXDR(xdrSwap, 'base64');
      if (sim) {
        return await simulateOperation(operation);
      }
      await invokeSorobanOperation(operation);
      cleanWalletCache();
    }
  }

  async function routerGetAmountIn(routerId: string, routerGetAmountInArgs: RouterGetAmountInArgs): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      const router = new RouterContract(routerId);
      const xdrGetAmountIn = router.routerGetAmountsIn(routerGetAmountInArgs);
      const operation = xdr.Operation.fromXDR(xdrGetAmountIn, 'base64');
      return await simulateOperation(operation);
    }
  }

  async function routerGetAmountOut(routerId: string, routerGetAmountOutArgs: RouterGetAmountOutArgs): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      const router = new RouterContract(routerId);
      const xdrGetAmountOut = router.routerGetAmountsOut(routerGetAmountOutArgs);
      const operation = xdr.Operation.fromXDR(xdrGetAmountOut, 'base64');
      return await simulateOperation(operation);
    }
  }

  async function routerPairFor(router: string, routerPairForArgs: RouterPairForArgs): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      const routerContract = new RouterContract(router);
      const operation = xdr.Operation.fromXDR(routerContract.routerPairFor(routerPairForArgs), 'base64');
      return await simulateOperation(operation);
    }
  }


  //********** Pool Functions ***********/

  /**
   * Submit a request to the pool
   * @param poolId - The contract address of the pool
   * @param submitArgs - The "submit" function args
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function poolSubmit(
    poolMeta: PoolMeta,
    submitArgs: SubmitArgs,
    sim: boolean
  ): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      console.log('poolMeta+Args+sim', poolMeta, submitArgs, sim)
      const pool =
        poolMeta.version === Version.V2
          ? new PoolContractV2(poolMeta.id)
          : new PoolContractV2(poolMeta.id);
      const operation = xdr.Operation.fromXDR(pool.submit(submitArgs), 'base64');
      if (sim) {
        return await simulateOperation(operation);
      }
      await invokeSorobanOperation<Positions>(operation, poolMeta.id);
      cleanPoolCache(poolMeta.id);
      cleanWalletCache();
    }
  }

  /**
   * Claim emissions from the pool
   * @param poolId - The contract address of the pool
   * @param claimArgs - The "claim" function args
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function poolClaim(
    poolMeta: PoolMeta,
    claimArgs: PoolClaimArgs,
    sim: boolean
  ): Promise<rpc.Api.SimulateTransactionResponse | undefined> {
    if (connected) {
      const pool =
        poolMeta.version === Version.V2
          ? new PoolContractV2(poolMeta.id)
          : new PoolContractV2(poolMeta.id);
      const operation = xdr.Operation.fromXDR(pool.claim(claimArgs), 'base64');
      if (sim) {
        return await simulateOperation(operation);
      }
      await invokeSorobanOperation(operation, poolMeta.id);
      cleanPoolCache(poolMeta.id);
      cleanWalletCache();
    }
  }

  async function createTrustlines(assets: Asset[]) {
    try {
      if (connected) {
        const account = await stellarRpc.getAccount(walletAddress);
        const tx_builder = new TransactionBuilder(account, {
          networkPassphrase: network.passphrase,
          fee: BASE_FEE,
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
        });
        for (let asset of assets) {
          const trustlineOperation = Operation.changeTrust({
            asset: asset,
          });
          tx_builder.addOperation(trustlineOperation);
        }
        const transaction = tx_builder.build();
        const signedTx = await sign(transaction.toXDR());
        const tx = new Transaction(signedTx, network.passphrase);
        setTxType(TxType.PREREQ);
        const result = await sendTransaction(tx);
        if (result) {
          cleanWalletCache();
        }
      }
    } catch (e: any) {
      console.error('Failed to create trustline: ', e);
      setFailureMessage(e?.message);
      setTxStatus(TxStatus.FAIL);
    }
  }

  async function getNetworkDetails() {
    try {
      const freighterDetails: any = await getFreighterNetwork();
      return {
        rpc: freighterDetails.sorobanRpcUrl,
        passphrase: freighterDetails.networkPassphrase,
        maxConcurrentRequests: network.maxConcurrentRequests,
        horizonUrl: freighterDetails.networkUrl,
      };
    } catch (e) {
      console.error('Failed to get network details from freighter', e);
      return network;
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        txStatus,
        setTxStatus,
        lastTxHash: txHash,
        lastTxFailure: txFailure,
        txType,
        walletId: XBULL_ID,
        isLoading: loading,
        connect,
        disconnect,
        clearLastTx,
        restore,
        swapExactTokensForTokens,
        swapTokensforExactTokens,
        routerGetAmountIn,
        routerGetAmountOut,
        routerPairFor,
        poolSubmit,
        poolClaim,
        createTrustlines,
        getNetworkDetails,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};
