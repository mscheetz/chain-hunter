import { RvnScriptSig } from './RvnScriptSig';

export class RvnVin {
    constructor() {}

    public txid: string;
    public vout: number;
    public sequence: number;
    public n: number;
    public scriptSig: RvnScriptSig;
    public addr: string;
    public valueSat: number;
    public value: number;
    public doubleSpentTxID: string;
}