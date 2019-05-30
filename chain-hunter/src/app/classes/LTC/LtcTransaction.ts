import { LtcIn } from './LtcIn';
import { LtcOut } from './LtcOut';

export class LtcTransaction {
    constructor() {}

    txid: string;
    version: number;
    locktime: number;
    vin: LtcIn[];
    vout: LtcOut[];
    blockhash: string;
    blockheight: number;
    confirmations: number;
    time: number;
    blocktime: number;
    valueOut: number;
    size: number;
    valueIn: number;
    fees: number;
}