import { Address } from './Address';
import { Transaction } from './Transaction';

export class Blockchain {
    constructor () {}

    name: string;
    symbol: string;
    found: boolean;
    address: Address;
    transaction: Transaction;
    icon: string;

    getIcon(): string {
        let iconBase = ""; //"/assets/cryptoicons/";
        let property = this.found ? "color" : "white";

        return iconBase + property + "/" + this.symbol.toLowerCase() + ".svg";
    }
} 
