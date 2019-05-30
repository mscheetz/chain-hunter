import { LtcTransaction } from './LtcTransaction';

export class LtcPagedTransactions {
    constructor() {}

    pagesTotal: number;
    txs: LtcTransaction[];
}