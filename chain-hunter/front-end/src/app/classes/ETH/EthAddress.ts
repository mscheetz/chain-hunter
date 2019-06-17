export class EthAddress {
    constructor() {}

    Address: string;
    Balance: number;
    getBalance(): number {
        if(this.Balance === null) {
            return null;
        } else if (this.Balance === 0) {
            return 0;
        } else {
            return this.Balance / Math.pow(10, 18);
        }
    }
}