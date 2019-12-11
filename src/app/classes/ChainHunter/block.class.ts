import { Transaction } from './transaction.class';

export class Block {
    constructor() {}

    blockNumber: number;
    date: string;
    hash: string;
    size: string;
    transactionCount: number;
    transactions: Transaction[];
    validator: string;
    volume: number;
}