import { BtcInput } from './BtcInput';
import { BtcOutput } from './BtcOutput';

export class BtcTransaction{
    constructor() {}

    confirmations: number;
    block_height: number;
    block_hash: string;
    block_time: number;
    created_at: number;
    fee: number;
    hash: string;
    inputs_count: number;
    inputs_value: number;
    is_coinbase: boolean;
    is_double_spend: boolean;
    is_sw_tx: boolean;
    weight: number;
    vsize: number;
    witness_hash: string;
    lock_time: number;
    outputs_count: number;
    outputs_value: number;
    size: number;
    sigops: number;
    version: number;
    inputs: BtcInput[];
    outputs: BtcOutput[];
}