import { Transaction } from './Transaction';
import { Asset } from './Asset';

export class Address {
    constructor() {} 

    address: string;
    quantity: string;
    transactions: Transaction[];
    tokens: Asset[];
    hasTransactions: boolean = true;
} 
