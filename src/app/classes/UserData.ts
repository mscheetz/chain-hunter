import { Blockchain } from './ChainHunter/blockchain.class';

export class UserData {
    constructor() {}

    id: string;
    hash: string;
    symbol: string;
    type: string;
    added: number;
    blockchain: Blockchain = null;
    active: boolean;
}