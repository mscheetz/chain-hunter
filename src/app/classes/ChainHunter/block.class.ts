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
    validatorIsAddress: boolean = true;
    volume: number;
    hasTransactions: boolean = true;
    confirmations: number;
}