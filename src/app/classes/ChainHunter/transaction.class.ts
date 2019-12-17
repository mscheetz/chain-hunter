import { IO } from './io.class';

export class Transaction{
    constructor () {}

    hash: string;
    from: string;
    to: string;
    symbol: string;
    quantity: string;
    date: string;
    confirmations: number;
    block: number;
    latestBlock: number;
    froms: IO[];
    tos: IO[];
    ios: IO[];
    type: string;
    inout: string;
    success: string;
} 
