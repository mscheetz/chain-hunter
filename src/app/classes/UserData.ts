import { Blockchain } from './ChainHunter/Blockchain';

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