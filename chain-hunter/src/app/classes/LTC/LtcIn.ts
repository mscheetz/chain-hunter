import { LtcSignature } from './LtcSignature';

export class LtcIn {
    constructor() {}

    txid: string;
    vout: number;
    sequence: number;
    n: number;
    scriptSig: LtcSignature;
    addr: string;
    valueSat: number;
    value: number;
    doubleSpentTxID: string;
}