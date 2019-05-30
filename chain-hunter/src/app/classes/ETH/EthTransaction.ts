export class EthTransaction {
    constructor() {}

    blockHash: string;
    blockNumber: string;
    from: string;
    gas: string;
    gasPrice: string;
    hash: string;
    input: string;
    nonce: string;
    to: string;
    transactionIndex: string;
    value: string;
    v: string;
    r: string;
    s: string;
    currentBlock: string;
    timestamp: string;

    getQuantity(): number {
        let intVal = parseInt(this.value);
        return intVal / 1000000000000000000;
    }

    getConfirmations(): number {
        let txnBlock = parseInt(this.blockNumber);
        let latestBlock = parseInt(this.currentBlock);

        return latestBlock - txnBlock;
    }
}