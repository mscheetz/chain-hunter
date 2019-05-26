import { BnbTxnMsg } from './BnbTxnMsg';
import { BnbSignature } from './BnbSignature';

export class BnbTxnValue {
    constructor() {}

    data: object;
    memo: string;
    msg: BnbTxnMsg[];
    signatures: BnbSignature[];
    source: string;
}