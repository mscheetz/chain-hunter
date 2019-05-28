export class BnbBalance {
    constructor() {}

    symbol: string;
    free: number;
    locked: number;
    frozen: number;

    public getTotal(): number {
        return this.free + this.locked + this.frozen;
    }
}