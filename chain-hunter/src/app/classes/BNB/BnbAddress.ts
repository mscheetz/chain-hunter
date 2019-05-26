import { BnbBalance } from './BnbBalance';

export class BnbAddress {
    constructor() {}

    address: string;
    public_key: number[];
    account_number: number;
    sequence: number;
    balances: BnbBalance[];
}