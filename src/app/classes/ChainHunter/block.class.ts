import { Transaction } from './transaction.class';

export class Block {
    constructor() {}

    blockNumber: string;
    date: string;
    hash: string;
    size: string;
    transactionCount: number;
    transactions: Transaction[];
    validator: string;
    volume: number;
    hasTransactions: boolean = true;
    confirmations: number;
}