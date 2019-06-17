import { NeoTxnIO } from './NeoTxnIO';

export class NeoTransaction {
    constructor() {}

    vouts: NeoTxnIO[];
    vin: NeoTxnIO[];
    version: number;
    type: string;
    txid: string;
    time: number;
    sys_fee: number;
    size: number;
    scripts: object[];
    pubkey: string;
    nonce: string;
    net_fee: number;
    description: string;
    contract: number;
    claims: NeoTxnIO[];
    block_height: number;
    block_hash: string;
    attributes: object[];
    asset: string;
}