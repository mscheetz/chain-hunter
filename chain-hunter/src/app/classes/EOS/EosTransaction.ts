import { EosActionTrace } from './EosActionTrace';

export class EosTransaction {
    constructor() {}

    global_action_seq: number;
    account_action_seq: number;
    block_num: number;
    block_time: string;
    action_trace: EosActionTrace;
}