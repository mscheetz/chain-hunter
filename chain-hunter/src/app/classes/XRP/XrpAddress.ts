export class XrpAddress {
    constructor() {}

    public account: string;
    public accountName: string;
    public inception: string;
    public initial_balanc: number;
    public ledger_index: number;
    public ownerCount: number;
    public parent: string;
    public previousAffectingTransactionId: string;
    public previousAffectingTransactionLedgerVersion: number;
    public sequence: number;
    public settings: object;
    public tx_hash: string;
    public xrpBalance: string;
}