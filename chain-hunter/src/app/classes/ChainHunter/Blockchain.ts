export class Blockchain {
    constructor () {}

    constructor(name: string, symbol:string) {
	this.Name = name;
	this.Symbol = symbol;
	this.Found = false;
	this.Address = null;
	this.Transaction = null;
    }

    Name: string;
    Symbol: string;
    Found: boolean;
    Address: Address;
    Transaction: Transaction;
} 
