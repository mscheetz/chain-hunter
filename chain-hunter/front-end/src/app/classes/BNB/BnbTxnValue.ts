import { BnbTxnMsg } from './BnbTxnMsg';
import { BnbSignature } from './BnbSignature';
import { BnbTxnIO } from './BnbTxnIO';

export class BnbTxnValue {
    constructor() {}

    data: object;
    memo: string;
    msg: BnbTxnMsg[];
    inputs: BnbTxnIO[];
    outputs: BnbTxnIO[];
    signatures: BnbSignature[];
    source: string;
}