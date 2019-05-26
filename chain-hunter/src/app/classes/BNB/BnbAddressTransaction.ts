export class BnbAddressTransaction {
    constructor() {}

    txHash: string;
    blockHeight: number;
    txType: string;
    timeStamp: number;
    fromAddr: string;
    toAddr: string;
    value: number;
    txAsset: string;
    mappedTxAsset: string;
    txFee: number;
    txAge: number;
    orderId: string;
    code: number;
    data: object;
    confirmBlocks: number;
    memo: string;
}