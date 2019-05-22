import { RvnVin } from './RvnVin';
import { RvnVout } from './RvnVout';

export class RvnTransaction {
    constructor() {}

    public txid: string;
    public version: number;
    public locktime: number;
    public vin: RvnVin[];
    public vout: RvnVout[];
    public blockhash: string;
    public blockheight: number;
    public confirmations: number;
    public time: number;
    public blocktime: number;
    public valueOut: number;
    public size: number;
    public valueIn: number;
    public fees: number;
}