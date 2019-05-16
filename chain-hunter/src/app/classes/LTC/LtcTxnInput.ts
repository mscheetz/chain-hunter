import { LtcReceived } from './LtcReceived';

export class LtcTxnInput {
    constructor() {}

    public addr: string;
    public amount: number;
    public received_from: LtcReceived;
}