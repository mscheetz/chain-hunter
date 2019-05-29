import { Transaction } from './Transaction';
import { Asset } from './Asset';

export class Address {
    constructor() {} 

    Address: string;
    Quantity: number;
    Transactions: Transaction[];
    Tokens: Asset[];
} 
