import { Asset } from "@stellar/stellar-sdk";
export interface TokenType {
  code: string;
  issuer?: string;
  contract: string;
  name?: string;
  org?: string;
  domain?: string;
  icon?: string;
  decimals?: number;
  asset: Asset;
}

export interface tokensResponse {
  network: string;
  tokens: TokenType[];
}

export type TokenMapType = {
  [key: string]: TokenType;
};

export type TokenBalancesMap = {
  [tokenAddress: string]: { usdValue: number; balance: string };
};
