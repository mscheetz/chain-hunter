export class TrxBlock {
    constructor() {}

    number: number;
    hash: string;
    size: number;
    timestamp: number;
    txTrieRoot: string;
    parentHash: string;
    witnessId: number;
    witnessAddress: string;
    nrOfTrx: number;
    confirmed: boolean;
}