import { AionToken } from './AionToken';

export class AionAddress {
    constructor() {}

    address: string;
    balance: number;
    contract: boolean;
    hasInternalTransfer: boolean;
    lastBlockNumber: number;
    nonce: number;    
    tokens: AionToken[];
}