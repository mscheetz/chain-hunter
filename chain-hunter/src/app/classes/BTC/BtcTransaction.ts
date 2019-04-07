import { BtcInput } from './BtcInput';
import { BtcOutput } from './BtcOutput';

export class BtcTransaction{
    constructor() {}

    block_height: number;
    block_time: number;
    created_at: number;
    fee: number;
    hash: string;
    inputs: BtcInput[];
    inputs_count: number;
    inputs_value: number;
    is_coinbase: boolean;
    lock_time: number;
    outputs: BtcOutput[];
    outputs_count: number;
    outputs_value: number;
    size: number;
    version: number;
}