import { TrxTransaction } from './TrxTransaction';

export class TrxAddressTransactionResponse {
    constructor() {}

    total: number;
    rangeTotal: number;
    data: TrxTransaction[];
}