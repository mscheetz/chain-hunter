export class BchTxnOutput {
    constructor() {}

    public addresses: string[];
    public value: number;
    public type: string;
    public script_asm: string;
    public script_hex: string;
    public spent_by_tx: string;
    public spent_by_tx_position: number;
}