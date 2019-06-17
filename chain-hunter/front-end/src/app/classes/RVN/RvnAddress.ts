export class RvnAddress {
    constructor() {}

    public addrStr: string;
    public balance: number;
    public balanceSat: number;
    public totalReceived: number;
    public totalReceivedSat: number;
    public totalSent: number;
    public totalSentSat: number;
    public unconfirmedBalance: number;
    public unconfirmedBalanceSat: number;
    public unconfirmedTxApperances: number; 
    public txApperances: number;
    public transactions: string[];
}