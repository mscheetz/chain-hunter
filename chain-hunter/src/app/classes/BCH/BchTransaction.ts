import { BchTxnInput } from './BchTxnInput';
import { BchTxnOutput } from './BchTxnOutput';

export class BchTransaction {
    constructor() {}

    public confirmations: number;
    public block_height: number;
    public block_hash: string;
    public block_time: number;
    public created_at: number;
    public fee: number;
    public hash: string;
    public inputs_count: number;
    public inputs_value: number;
    public is_coinbase: boolean;
    public is_double_spend: boolean;
    public is_sw_tx: boolean;
    public weight: number;
    public vsize: number;
    public witness_hash: string;
    public lock_time: number;
    public outputs_count: number;
    public outputs_value: number;
    public size: number;
    public sigops: number;
    public version: number;
    public inputs: BchTxnInput[];
    public outputs: BchTxnOutput[];        
}