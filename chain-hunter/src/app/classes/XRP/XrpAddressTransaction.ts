export class XrpAddressTransaction {
    constructor() {}

    public amount: string;
    public currency: string;
    public delivered_amount: string;
    public destination: string;
    public destination_balance_changes: object[];
    public executed_time: string;
    public ledger_index: number;    
    public source: string;
    public source_balance_changes: object[];
    public source_currency: string;
    public transaction_cost: string;
    public tx_hash: string;
    public tx_index: number;
}