export class EthplorerHeader<T> {
    constructor() {}

    address: string;
    ETH: Map<string, number>;
    countTxs: number;
    tokens: T;
}