export class BtcOutput{
    constructor() {}

    addresses: string[];
    value: number;
    type: string;
    spent_by_tx: string;
    spent_by_tx_position: number;
}