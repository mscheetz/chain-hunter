export class BchAddress {
    constructor() {}
    
    public address: string;
    public received: number;
    public sent: number;
    public balance: number;
    public tx_count: number;
    public unconfirmed_tx_count: number;
    public unconfirmed_received: number;
    public unconfirmed_sent: number;
    public unspent_tx_count: number;
    public first_tx: string; 
    public last_tx: string;

}