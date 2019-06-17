import { EosAction } from './EosAction';
import { EosReceipt } from './EosReceipt';

export class EosActionTrace {
    constructor() {}

    receipt: EosReceipt;
    act: EosAction;
    context_free: boolean;
    elapsed: number;
    console: string;
    trx_id: string;
    block_num: number;
    block_time: string;
    producer_block_id: string;
    account_ram_deltas: string[];
    except: string;
    inline_traces: string[];
}