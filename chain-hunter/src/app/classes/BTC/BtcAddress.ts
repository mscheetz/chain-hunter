export class BtcAddress {
    constructor() {}

    address: string;
    received: number;
    send: number;
    balance: number;
    tx_count: number;
    unconfirmed_tx_count: number;
    unconfirmed_received: number;
    unconfirmed_sent: number;
    unspent_tx_count: number;
}