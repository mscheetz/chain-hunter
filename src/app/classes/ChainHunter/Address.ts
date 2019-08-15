import { Transaction } from './Transaction';
import { Asset } from './Asset';

export class Address {
    constructor() {} 

    address: string;
    quantity: number;
    transactions: Transaction[];
    tokens: Asset[];
    hasTransactions: boolean = true;
} 
