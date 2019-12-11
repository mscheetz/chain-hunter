import { Transaction } from './transaction.class';

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