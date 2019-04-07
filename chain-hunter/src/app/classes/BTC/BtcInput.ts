export class BtcInput {
    constructor(){}

    prev_address: string[];
    prev_position: number;
    prev_tx_hash: string;
    prev_value: number;
    script_asm: string;
    script_hex: string;
    sequence: number;
}