import { BnbPubKey } from './BnbPubKey';

export class BnbSignature {
    constructor() {}

    account_number: string;
    pub_key: BnbPubKey;
    sequence: string;
    signature: string;
}