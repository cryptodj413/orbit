import { Reserve, TokenMetadata } from '@blend-capital/blend-sdk';
import { NEXT_PUBLIC_STELLAR_EXPERT_URL } from '../config/constants';

export interface ReserveTokenMetadata extends TokenMetadata {
  assetId: string;
  image?: string;
  domain?: string;
}

export function getTokenLinkFromReserve(reserve: Reserve | undefined) {
  if (!reserve) {
    return '';
  }
  return `${NEXT_PUBLIC_STELLAR_EXPERT_URL}/contract/${reserve.assetId}`;
}
