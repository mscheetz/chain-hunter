import { Transaction } from './Transaction';

export class Block {
    constructor() {}

    blockNumber: number;
    validator: string;
    transactionCount: number;
    date: string;
    size: string;
    hash: string;
    transactions: Transaction[];
}