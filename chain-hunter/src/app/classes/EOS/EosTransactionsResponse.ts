import { EosTransaction } from './EosTransaction';

export class EosTransactionsResponse {
    constructor() {}

    actions: EosTransaction[];
    last_irreversible_block: number;
}