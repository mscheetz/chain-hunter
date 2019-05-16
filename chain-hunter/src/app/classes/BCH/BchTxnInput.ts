export class BchTxnInput {
    constructor() {}

    public prev_addresses: string[];
    public prev_position: number;
    public prev_tx_hash: string;
    public prev_type: string;
    public prev_value: number;
    public sequence: number;
    public script_asm: string;
    public script_hex: string;
    public witness: string[];
}