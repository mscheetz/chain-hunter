import { LtcPublickey } from './LtcPublicKey';

export class LtcOut {
    constructor() {}

    value: number;
    n: number;
    scriptPubKey: LtcPublickey;
    spentTxId: string;
    spentIndex: number;
    spentHeight: number;
}