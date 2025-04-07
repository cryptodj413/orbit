import { Asset } from '@stellar/stellar-sdk';
import {NEXT_PUBLIC_USDC_ISSUER, NEXT_PUBLIC_BLND_ISSUER} from '../config/constants'


export const USDC_ASSET = new Asset('USDC', NEXT_PUBLIC_USDC_ISSUER || '');

export const BLND_ASSET = new Asset('BLND', NEXT_PUBLIC_BLND_ISSUER || '');

export const MAINNET_USDC_CONTRACT_ADDRESS =
  'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75';
