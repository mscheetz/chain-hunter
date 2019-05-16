import { LtcTxnInput } from './LtcTxnInput';
import { LtcTxnOutput } from './LtcTxnOutput';

export class LtcTransaction {
    constructor() {}

    public hash: string;
    public block: number;
    public index: number;
    public timestamp: number;
    public confirmations: number;
    public fees: number;
    public totl_input: number;
    public inputs: LtcTxnInput[];
    public total_output: number;
    public outputs: LtcTxnOutput[];
}