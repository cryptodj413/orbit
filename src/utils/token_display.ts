import { Asset } from '@stellar/stellar-sdk';
import {NEXT_PUBLIC_OUSD_ISSUER, NEXT_PUBLIC_BLND_ISSUER} from '../config/constants'


export const OUSD_ASSET = new Asset('OUSD', NEXT_PUBLIC_OUSD_ISSUER || '');

export const BLND_ASSET = new Asset('BLND', NEXT_PUBLIC_BLND_ISSUER || '');
