import { Address } from './Address';
import { Transaction } from './Transaction';
import { Contract } from './Contract';

export class Blockchain {
    constructor () {}

    name: string;
    symbol: string;
    found: boolean;
    address: Address;
    transaction: Transaction;
    contract: Contract;
    icon: string;
    source: string;
    hasTokens: boolean = false;
    hasContracts: boolean = false;

    getIcon(): string {
        let iconBase = ""; //"/assets/cryptoicons/";
        let property = this.found ? "color" : "white";

        return iconBase + property + "/" + this.symbol.toLowerCase() + ".png";
    }
} 
