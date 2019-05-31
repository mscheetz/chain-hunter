export class XrpAddressTransaction {
    constructor() {}

    amount: string;
    currency: string;
    delivered_amount: string;
    destination: string;
    destination_balance_changes: object[];
    executed_time: string;
    ledger_index: number;    
    source: string;
    source_balance_changes: object[];
    source_currency: string;
    transaction_cost: string;
    tx_hash: string;
    tx_index: number;
}