import { NeoUnspent } from './NeoUnspent';

export class NeoAsset {
    constructor () {}

    unspent: NeoUnspent[];
    asset_symbol: string;
    asset_hash: string;
    asset: string;
    amount: number;
}