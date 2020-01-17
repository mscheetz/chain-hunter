import { Address } from './address.class';
import { Transaction } from './transaction.class';
import { Contract } from './contract.class';
import { Block } from './block.class';

export class Blockchain {
    constructor () {}

    id: string;
    name: string;
    symbol: string;
    found: boolean;
    address: Address;
    transaction: Transaction;
    contract: Contract;
    block: Block;
    blocks: Block[];
    icon: string;
    type: string;
    source: string = null;
    hasTokens: boolean = false;
    hasContracts: boolean = false;
    status: number;

    getIcon(): string {
        let iconBase = ""; //"/assets/cryptoicons/";
        let property = this.found ? "color" : "white";

        return iconBase + property + "/" + this.symbol.toLowerCase() + ".svg";
    }
} 
