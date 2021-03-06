import { Transaction } from './transaction.class';
import { Asset } from './asset.class';

export class Address {
    constructor() {} 

    address: string;
    quantity: string;
    transactions: Transaction[];
    tokens: Asset[];
    transactionCount: number;
    hasTransactions: boolean = true;
} 
