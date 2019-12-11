import { Transaction } from './Transaction';
import { Asset } from './asset.class';

export class Address {
    constructor() {} 

    address: string;
    quantity: string;
    transactions: Transaction[];
    tokens: Asset[];
    hasTransactions: boolean = true;
} 
